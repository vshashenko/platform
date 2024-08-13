<script lang="ts">
  import Card from '@hcengineering/presentation/src/components/Card.svelte'
  import video from '@hcengineering/video'
  import {
    Button,
    ButtonKind,
    ButtonSize,
    closePopup,
    DropdownLabels,
    DropdownLabelsIntl,
    DropdownTextItem,
    Row,
    showPopup,
    ToggleWithLabel
  } from '@hcengineering/ui'
  import { defaultRecordingOptions, RecordingOptions, RecordingState, recordingStates, shareTypes } from '../index'
  import { Writable } from 'svelte/store'
  import _ from 'lodash'

  export let recordingState: Writable<RecordingState>
  $: options = defaultRecordingOptions
  $: {
    recordingState.set(new RecordingState('updateOptions', options))
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
    options.microphone = microphones[0].id
    cameras = getDevice(devices, 'videoinput')
    options.camera = cameras[0].id
    options = options
  })()
</script>

<Card
  label={video.string.RecordingSettings}
  onCancel={() => {
    recordingState.set(new RecordingState('cancelled'))
    closePopup('recordingSettings')
  }}
  width={'small'}
  okLabel={video.string.StartRecording}
  okAction={() => {
    if (options.countdown) {
      recordingState.set(new RecordingState('countdown'))
    } else {
      recordingState.set(new RecordingState('recording'))
    }
    closePopup('recordingSettings')
  }}
  canSave={true}
>
  <ToggleWithLabel
    label={video.string.Countdown}
    on={options.countdown}
    on:change={(event) => {
      options.countdown = event.detail
      options = options
    }}
  />
  <DropdownLabels items={constArrToDropdownItem(shareTypes)} label={video.string.ShareType} />
  <DropdownLabels
    label={video.string.Microphone}
    items={microphones}
    on:selected={(event) => {
      options.microphone = event.detail
      options = options
    }}
    selected={options.microphone}
  />
  <DropdownLabels
    label={video.string.Camera}
    items={cameras}
    on:selected={(event) => {
      options.camera = event.detail
      options = options
    }}
    selected={options.camera}
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
