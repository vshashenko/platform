<script lang="ts">
  import Card from '@hcengineering/presentation/src/components/Card.svelte'
  import video from '@hcengineering/video'
  import { closePopup, DropdownLabels, DropdownTextItem, ToggleWithLabel } from '@hcengineering/ui'
  import {
    shareType as typeStore,
    microphone as micStore,
    camera as camStore,
    recordingState as stateStore,
    useCountdown as countdownStore,
    RecordingState,
    shareTypes
  } from '../utils/recordingState'
  import _ from 'lodash'

  $: useCountdown = $countdownStore
  $: recordingState = $stateStore
  $: microphone = $micStore
  $: camera = $camStore
  $: shareType = $typeStore
  $: {
    console.log('RecordingSettings: $', useCountdown, recordingState, microphone, camera, shareType)
  }

  function constArrToDropdownItem(vals: readonly string[]): DropdownTextItem[] {
    return vals.map((id) => {
      let label = id.replace(/([A-Z])/g, ' $1')
      label = label.charAt(0).toUpperCase() + label.slice(1)
      return {
        id,
        label
      }
    })
  }

  const nullDevice: DropdownTextItem = { label: 'None', id: 'none' }
  $: microphones = [nullDevice]
  $: cameras = [nullDevice]
  ;(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const getDevice = (devices: MediaDeviceInfo[], kind: MediaDeviceKind): DropdownTextItem[] => {
      return devices
        .filter((item) => item.kind === kind)
        .map((item) => {
          return {
            label: item.label,
            id: item.deviceId
          }
        })
        .concat(nullDevice)
    }
    microphones = getDevice(devices, 'audioinput')
    micStore.set(microphones[0].id)
    cameras = getDevice(devices, 'videoinput')
    camStore.set(cameras[0].id)
  })()
</script>

<Card
  label={video.string.RecordingSettings}
  onCancel={() => {
    recordingState = 'cancelled'
    closePopup('recordingSettings')
  }}
  width={'small'}
  okLabel={video.string.StartRecording}
  okAction={() => {
    if (useCountdown) {
      recordingState = 'countdown'
    } else {
      recordingState = 'recording'
    }
    closePopup('recordingSettings')
  }}
  canSave={true}
>
  <ToggleWithLabel
    label={video.string.Countdown}
    on={useCountdown}
    on:change={(event) => {
      countdownStore.set(event.detail)
    }}
  />
  <DropdownLabels
    items={constArrToDropdownItem(shareTypes)}
    label={video.string.ShareType}
    on:selected={(event) => {
      typeStore.set(event.detail)
    }}
    selected={shareType}
  />
  <DropdownLabels
    label={video.string.Microphone}
    items={microphones}
    on:selected={(event) => {
      micStore.set(event.detail)
    }}
    selected={microphone}
  />
  <DropdownLabels
    label={video.string.Camera}
    items={cameras}
    on:selected={(event) => {
      camStore.set(event.detail)
    }}
    selected={camera}
  />
</Card>

<style lang="scss">
  //   .settings {
  //     background-color: var(--theme-popup-color);
  //     border-radius: var(--large-BorderRadius);
  //     padding: var(--spacing-1);
  //     text: var(--theme-text-primary-color);
  //   }
</style>
