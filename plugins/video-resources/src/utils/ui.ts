export const Resolution = {
  '1080p': [1920, 1080],
  '720p': [1280, 720]
}
type R = typeof Resolution
export type AcceptedResolution = keyof R
export type AcceptedFramerate = 24 | 30 | 60

// might be able to get away without specifying codecs
export const mimePrefs = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/mp4;codecs=avc1,opus'
]

/** Bitmask. e.g. `RecordingMode.camera | RecordingMode.cameraAudio //(0011)` */
export enum RecordingMode {
  camera = 1 << 0,
  cameraAudio = 1 << 1,
  screen = 1 << 2,
  screenAudio = 1 << 3,
};
export const DefaultRecordingMode: RecordingMode = RecordingMode.camera | RecordingMode.cameraAudio | RecordingMode.screen | RecordingMode.screenAudio

export interface RecordingOptions {
  resolution: AcceptedResolution
  framerate: AcceptedFramerate
  mode: RecordingMode
}
export const DefaultOptions: RecordingOptions = {
  resolution: '1080p',
  framerate: 30,
  mode: DefaultRecordingMode
}
export function getBestBitrate (width: number, height: number, fps: number): number {
  // this will depend on codec
  const bitsPerChannel = 8
  const subsampling = 0.5
  return width * height * bitsPerChannel * 3 * subsampling * fps
}
