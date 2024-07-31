import * as tus from 'tus-js-client'

export type ReadResult = ReadableStreamReadResult<Blob>

export interface StreamOptions {
  chunkSize: number
  filename: string
  endpoint: string
  onStart?: () => void
  onStop?: () => void
  onSuccess?: (upload?: tus.Upload) => void
  onError?: (error: Error | tus.DetailedError) => void
  onProgress?: (bytesSent: number, bytesTotal: number) => void
}
export const defaultStreamOptions: StreamOptions = {
  chunkSize: 10000,
  filename: 'New recording '.concat(new Date().toISOString()),
  endpoint: 'http://localhost:1080'
}

export class MediaStreamer {
  options: StreamOptions
  recorder?: MediaRecorder
  upload?: tus.Upload

  constructor (options: StreamOptions = defaultStreamOptions) {
    this.options = options
  }

  start (source: MediaStream): void {
    let onDataAvailable: null | ((p: Promise<ReadResult>) => void) = null
    const recorder = new MediaRecorder(source)
    const chunks: Blob[] = []
    recorder.onstop = () => {
      this.options.onStop?.()
    }
    recorder.ondataavailable = (ev) => {
      chunks.push(ev.data)
      if (onDataAvailable !== null) {
        onDataAvailable(readableRecorder.read())
        onDataAvailable = null
      }
    }
    const readableRecorder = {
      read: async (): Promise<ReadResult> => {
        if (recorder.state === 'inactive' && chunks.length === 0) {
          return await Promise.resolve({ done: true })
        }
        if (chunks.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const value = chunks.shift()!
          return await Promise.resolve({ value, done: false })
        }
        return await new Promise((resolve) => {
          onDataAvailable = resolve
        })
      }
    }
    this.options.onStart?.()
    this.upload = getStream(readableRecorder, {
      ...this.options,
      onSuccess: () => {
        this.options.onSuccess?.(this.upload)
      }
    })
    this.recorder = recorder
    recorder.start(1000)
    this.upload.start()
  }

  async stop (abort: boolean): Promise<string | null | undefined> {
    this.options.onStop?.()
    this.recorder?.stream.getTracks().forEach(t => { t.stop() })
    this.recorder?.stop()
    if (abort) {
      await this.upload?.abort(true)
    } else {
      return this.upload?.url
    }
  }
}

function getStream (reader: { read: () => Promise<ReadResult> }, options: StreamOptions = defaultStreamOptions): tus.Upload {
  const tusUploadOpts: Partial<tus.UploadOptions> = {
    endpoint: options.endpoint,
    chunkSize: options.chunkSize,
    retryDelays: [0, 1000, 3000, 5000],
    uploadLengthDeferred: true,
    metadata: {
      filename: options.filename,
      filetype: 'video/webm'
    },
    onError: options.onError,
    onSuccess: options.onSuccess,
    onProgress: options.onProgress
  }
  return new tus.Upload(reader, tusUploadOpts)
}
