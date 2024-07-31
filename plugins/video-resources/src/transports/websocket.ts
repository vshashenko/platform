import { logerr } from '../utils/log'
import { type Streamer } from '../utils/stream'
import * as Protocol from './protocol'

// Streams data over a websocket.
export class WebsocketTransport implements Protocol.Transport {
  ws: WebSocket | null = null
  streamer: Streamer | null = null
  endpoint: string | URL
  get readyState (): Protocol.ReadyState {
    return this.ws?.readyState ?? Protocol.ReadyState.closed
  }

  get initialized (): boolean {
    return (this.ws !== null &&
        this.ws.readyState === Protocol.ReadyState.open &&
        this.streamer !== null &&
        this.streamer !== undefined)
  }

  constructor (endpoint: string | URL) {
    this.endpoint = endpoint
  }

  send = <T extends Protocol.Data>(item: ArrayBuffer | Protocol.Msg<T>): void => {
    if (!this.initialized) {
      logerr('Tried to send when not initialized!')
      return
    }
    if (Protocol.isMsg(item)) {
      this.ws?.send(JSON.stringify(item))
    } else {
      this.ws?.send(item)
    }
  }

  openStream = (streamer: Streamer, onOpen: () => void, onClose: (reason?: string) => void): void => {
    this.streamer = streamer
    this.ws = new WebSocket(this.endpoint)
    this.ws.onopen = () => { onOpen() }
    this.ws.onclose = (ev) => { onClose(ev.reason) }
    this.ws.onmessage = this.onmessage
  }

  closeStream = (err?: Protocol.Error): void => {
    if (!this.initialized) {
      logerr('Tried to close when not initialized!')
      return
    }
    if (err !== undefined) {
      this.ws?.send(JSON.stringify(err))
    }
    this.ws?.close()
  }

  onmessage = async (ev: MessageEvent): Promise<void> => {
    if (!this.initialized) {
      logerr('Tried to parse message when not initialized!')
      return
    }
    const msg: Protocol.Msg<Protocol.Data> = JSON.parse(ev.data)
    this.streamer?.onMsg(msg)
  }
}
