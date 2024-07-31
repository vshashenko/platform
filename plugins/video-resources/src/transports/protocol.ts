import { type Streamer } from '../utils/stream'

export enum MsgType {
  undefined,
  error = 'error',
  initReq = 'initReq',
  initResp = 'initResp',
  streamHeader = 'streamHeader',
  streamHeaderResp = 'streamHeaderResp',
  // streams are sent as bare arraybuffers
  streamResp = 'streamResp',
  close = 'close',
  closeResp = 'closeResp'
}

export class Msg<T extends Data = Data> {
  readonly type: MsgType = MsgType.undefined
  data: T
  constructor (data: T) {
    this.data = data
  }
}

// data types
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Data { }
export type InitData = Data & {
  encoding: string
}
export type ConnectionData = Data & {
  url: string
  id?: never
}
export type StreamHeaderData = Data & { url: string, id: number }

export type ErrorData<T extends Data> = {
  error: string
} & T

// msg types
export class Error<T extends Data = Data> extends Msg<ErrorData<T>> {
  type = MsgType.error
}

export class InitReq extends Msg<InitData> {
  type = MsgType.initReq
}
export class InitResp extends Msg<ConnectionData> {
  type = MsgType.initResp
}

export class StreamHeader extends Msg<StreamHeaderData> {
  type = MsgType.streamHeader
}
export class StreamHeaderResp extends Msg<StreamHeaderData> {
  type = MsgType.streamHeaderResp
}
export class StreamResp extends Msg<StreamHeaderData> {
  type = MsgType.streamResp
}

export class CloseReq extends Msg<ConnectionData> {
  type = MsgType.close
}
export class CloseResp extends Msg<ConnectionData> {
  type = MsgType.closeResp
}

export enum ReadyState {
  connecting = 0,
  open = 1,
  closing = 2,
  closed = 3
}

export interface Transport {
  readyState: ReadyState
  openStream: (s: Streamer, onOpen: () => void, onClose: () => void) => void
  closeStream: (err?: Error) => void
  send: (buf: ArrayBuffer | Msg) => void
}

export function isMsg<D extends Data> (item: any): item is Msg<D> {
  return 'type' in item && item.type in MsgType
}
