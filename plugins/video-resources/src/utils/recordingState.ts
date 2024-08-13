import { derived, writable } from 'svelte/store'

export const recordingStates = [
  'init',
  'countdown',
  'recording',
  'paused',
  'cancelled',
  'finished'
] as const
export type RecordingState = typeof recordingStates[number]

export const shareTypes = [
  'fullScreen',
  'thisWindow',
  'thisTab',
  'cameraOnly'
] as const
export type ShareType = typeof shareTypes[number]

export const recordingState = writable<RecordingState>()
export const useCountdown = writable<boolean>(true)
export const shareType = writable<ShareType>('fullScreen')
export const microphone = writable<string>('none')
export const camera = writable<string>('none')
export const options = derived([useCountdown, shareType, microphone, camera], ($opts) => {
  return { useCountdown: $opts[0], shareType: $opts[1], microphone: $opts[2], camera: $opts[3] }
})
