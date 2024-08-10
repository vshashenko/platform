<script lang="ts">
  import Card from '@hcengineering/presentation/src/components/Card.svelte'
  import video from '@hcengineering/video'
  import { Button, ButtonKind, ButtonSize, closePopup, Row, showPopup } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import { defaultRecordingOptions, RecordingOptions, RecordingState, recordingStates } from '../index'
  import { Writable } from 'svelte/store'

  export let recordingState: Writable<RecordingState>
  let options: RecordingOptions = defaultRecordingOptions
</script>

<Card
  label={video.string.VideoSettings}
  onCancel={() => {
    recordingState.set({ state: 'cancelled' })
    closePopup('recordingSettings')
  }}
  width={'menu'}
  okLabel={video.string.NewRecording}
  okAction={() => {
    if (options.countdown) {
      recordingState.set({ state: 'countdown', options })
    } else {
      recordingState.set({ state: 'recording', options })
    }
    closePopup('recordingSettings')
  }}
  canSave={true}
>
  settings!
</Card>

<style lang="scss">
  //   .settings {
  //     background-color: var(--theme-popup-color);
  //     border-radius: var(--large-BorderRadius);
  //     padding: var(--spacing-1);
  //     text: var(--theme-text-primary-color);
  //   }
</style>
