// The MemoryServer is a 'server' for the VideoRecorder
// which simply streams the video directly to an Array.

import presentation from '@hcengineering/presentation'
import { getMetadata } from '@hcengineering/platform'
import { log2bucket, log2server, logerr } from '../utils/log'
import { type Streamer } from '../utils/stream'
import * as Protocol from './protocol'
import _ from 'lodash'
import * as tus from 'tus-js-client'

export default class TusServer implements Protocol.Transport {
  buf: ArrayBuffer[] = []
  streamer?: Streamer
  readyState: Protocol.ReadyState = Protocol.ReadyState.closed
  streamHeaderData?: Protocol.StreamHeaderData
  connection: Protocol.ConnectionData
  onClose?: (reason?: string) => void
  upload?: tus.Upload

  constructor (endpoint: string | URL) {
    this.connection = { url: endpoint as string }
  }

  openStream = (s: Streamer, onOpen: () => void, onClose: (reason?: string) => void): void => {
    this.streamer = s
    this.upload = new tus.Upload(s.readableStream.getReader(), {
      endpoint: this.connection.url,
      chunkSize: 1000,
      headers: {
        Authorization: 'Bearer ' + (getMetadata(presentation.metadata.Token) as string)
      },
      onError: (err) => {
        logerr('tus onError', err)
      },
      onSuccess: () => {
        log2server('tus onSuccess')
      },
      onProgress: (bytesSent, bytesTotal) => {
        log2bucket('tus onProgress:', bytesSent, '/', bytesTotal)
      }
    })
    this.upload.start()
    onOpen()
    this.onClose = onClose
    log2bucket('Opening stream')
  }

  closeStream = (err?: Protocol.Error): void => {
    if (err !== undefined) {
      this.onClose?.(err.data.error)
    } else {
      this.onClose?.()
      // send to server
    }
  }

  send = (data: ArrayBuffer | Protocol.Msg): void => {
    if (Protocol.isMsg(data)) {
      const key = data.type as keyof this
      if (typeof this[key] === 'function') {
        (this[key] as CallableFunction)(data)
      } else {
        logerr('Unknown message')
      }
    } else {
      if (this.streamHeaderData !== undefined) {
        this.streamer?.onMsg(new Protocol.StreamResp(this.streamHeaderData))
        delete this.streamHeaderData
        const size = _.reduce(this.buf, (last, buf) => last + buf.byteLength, 0)
        log2bucket('Buffer length:', size)
      } else {
        this.closeStream(new Protocol.Error({ error: 'Got buffer without header!' }))
      }
    }
  }

  initReq = (req: Protocol.InitReq): void => {
    this.streamer?.onMsg(new Protocol.InitResp(this.connection))
    this.readyState = Protocol.ReadyState.open
  }

  streamHeader = (req: Protocol.StreamHeader): void => {
    this.streamHeaderData = req.data
    this.streamer?.onMsg(new Protocol.StreamHeaderResp(this.streamHeaderData))
  }

  closeReq = (req: Protocol.CloseReq): void => {
    this.closeStream()
    this.streamer?.onMsg(new Protocol.CloseResp(this.connection))
    this.readyState = Protocol.ReadyState.closed
  }
}
