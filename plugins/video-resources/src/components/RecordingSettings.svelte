<script lang="ts">
  import Card from '@hcengineering/presentation/src/components/Card.svelte'
  import video from '@hcengineering/video'
  import { Button, ButtonKind, ButtonSize, closePopup, Row, showPopup } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import { type recordingEvent } from '../index'

  const dispatch = createEventDispatcher<Record<recordingEvent, any>>()
</script>

<Card
  label={video.string.VideoSettings}
  onCancel={() => {
    dispatch('cancelRecording')
    closePopup('recordingSettings')
  }}
  width={'menu'}
  okLabel={video.string.NewRecording}
  okAction={() => {
    dispatch('beginRecordingCountdown')
    closePopup('recordingSettings')
  }}
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
