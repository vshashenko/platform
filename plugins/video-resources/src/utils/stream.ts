import * as Protocol from '../transports/protocol'
import { log2client, log2server, logerr } from './log'
import { type Transport } from '../transports/protocol'

// Browsers are very picky about MIME types for video players.
// This is a list of commonly used codecs.
const mimePrefs = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/mp4;codecs=avc1,opus'
]
export const encoding =
    mimePrefs.find((val) => MediaSource.isTypeSupported(val)) ??
    mimePrefs[mimePrefs.length]

export class Streamer {
  // TODO: Adjust recording quality based on detected resolution
  // and backpressure
  options: { timeslice: number } & MediaRecorderOptions = {
    timeslice: 1000,
    mimeType: encoding,
    videoBitsPerSecond: 8000000,
    audioBitsPerSecond: 192000
  }

  bufs: ArrayBuffer[] = []
  readableStream: ReadableStream
  lastStreamId = 0

  transport: Transport
  stream?: MediaStream
  recorder?: MediaRecorder
  connection?: Protocol.ConnectionData
  waitingFor?: Protocol.MsgType | null
  openResolve?: () => void
  openReject?: (reason?: string) => void
  closeResolve?: () => void
  closeReject?: (reason?: string) => void

  constructor (transport: Transport) {
    this.transport = transport
    this.readableStream = new ReadableStream({
      type: 'bytes',
      start: async (controller) => {

      },
      pull: async (controller) => {
        const { value: buf, done } = this.bufs.values().next()
        console.log('pull! buf=', buf)
        if (buf !== undefined) {
          const value = new Uint8Array(buf)
          controller.enqueue(value)
        } else if (done as boolean && this.recorder?.state === 'inactive') {
          controller.close()
        }
      }
    })
  }

  endRecording = (): void => {
    if (this.stream !== undefined) {
      this.stream.getTracks().forEach(t => { t.stop() })
      delete this.stream
    }
    if (this.recorder !== undefined && this.recorder.state !== 'inactive') {
      this.recorder.stop()
      this.waitingFor = Protocol.MsgType.streamHeader
      delete this.recorder
    }
  }

  openStream = (stream: MediaStream, resolve: () => void, reject: (reason?: string) => void, options?: typeof this.options): void => {
    this.stream = stream
    this.recorder = new MediaRecorder(stream, {
      mimeType: this.options.mimeType,
      videoBitsPerSecond: this.options.videoBitsPerSecond,
      audioBitsPerSecond: this.options.audioBitsPerSecond
    })
    this.recorder.ondataavailable = async (ev: BlobEvent) => {
      const buf = await ev.data.arrayBuffer()
      this.sendBuf(buf)
    }
    if (options !== undefined) {
      this.options = options
    }
    this.openResolve = resolve
    this.openReject = reject

    this.waitingFor = Protocol.MsgType.initResp
    this.transport.openStream(this, this.onTransportOpen, this.onTransportClose)
  }

  onMsg = (msg: Protocol.Msg): void => {
    const key = msg.type as keyof this
    if (typeof this[key] === 'function') {
      (this[key] as CallableFunction)(msg)
    } else {
      logerr('Unknown message')
    }
  }

  onTransportOpen = (): void => {
    this.transport.send(new Protocol.InitReq({ encoding }))
  }

  onTransportClose = (reason?: string): void => {
    let errmsg
    if (reason !== undefined) {
      errmsg = 'Closed with reason'
      logerr({ type: errmsg, icon: '🛑' }, reason)
    } else {
      if (this.waitingFor === null) {
        log2client({ type: 'Closed normally', icon: '🛑' })
      } else {
        errmsg = `Closed while waiting for ${this.waitingFor}`
        logerr({
          type: errmsg,
          icon: '🛑'
        })
      }
    }
    this.waitingFor = null
    this.openReject?.(errmsg)
    this.closeReject?.(errmsg)
    this.endRecording()
  }

  initResp = (resp: Protocol.InitResp): void => {
    log2client('initResp', resp)
    // this.recorder?.start(this.options.timeslice)
    this.recorder?.start()
    this.connection = resp.data
    this.waitingFor = null
    this.openResolve?.()
    delete this.openResolve
    delete this.openReject
  }

  closeResp = (resp: Protocol.CloseResp): void => {
    log2client({ icon: '⏹️', type: 'closeResp' }, resp)
    this.waitingFor = null
    this.closeResolve?.()
    delete this.closeResolve
    delete this.closeReject
  }

  sendBuf = (buf: ArrayBuffer): void => {
    if (buf.byteLength !== 0) {
      log2server('Stream (length)', buf.byteLength)
      this.bufs.push(buf)
    } else {
      console.error('Recorded empty buf!')
    }

    const sendReq = (): void => {
      if (
        this.transport.readyState === 1 &&
          this.bufs.length !== 0 &&
          (this.waitingFor === null || this.waitingFor === Protocol.MsgType.streamHeader) &&
          this.connection !== null && this.connection !== undefined
      ) {
        const header = new Protocol.StreamHeader({
          id: this.lastStreamId++,
          url: this.connection.url
        })
        log2server('StreamHeader', header)
        this.transport.send(header)
        this.waitingFor = Protocol.MsgType.streamHeaderResp
      } else {
        setTimeout(sendReq)
      }
    }
    sendReq()
  }

  streamHeaderResp = (resp: Protocol.StreamHeaderResp): void => {
    log2client('streamHeaderResp', resp)
    if (this.bufs.length !== 0) {
      const buf = this.bufs.shift()
      if (buf !== null && buf !== undefined) {
        this.transport.send(buf)
        this.waitingFor = Protocol.MsgType.streamResp
        log2server('Stream (length)', buf.byteLength)
      }
    } else {
      console.error('Tried to send stream on empty buffer!')
    }
  }

  streamResp = (resp: Protocol.StreamResp): void => {
    log2client('streamResp', resp)
    this.waitingFor = null
  }

  closeStream = (resolve: () => void, reject: (reason?: string) => void): void => {
    this.endRecording()
    this.closeResolve = resolve
    this.closeReject = reject
    const sendReq = (): void => {
      if (
        this.recorder === undefined && this.stream === undefined &&
        this.transport.readyState === Protocol.ReadyState.open &&
          this.bufs.length === 0 &&
          (this.waitingFor === null || this.waitingFor === undefined) &&
          this.connection !== null && this.connection !== undefined
      ) {
        const req = new Protocol.CloseReq({ url: this.connection.url })
        log2server('CloseReq', req)
        this.transport.send(req)
        this.waitingFor = Protocol.MsgType.closeResp
      } else {
        setTimeout(sendReq)
      }
    }
    sendReq()
  }
}
