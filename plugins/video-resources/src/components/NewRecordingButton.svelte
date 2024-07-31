<script lang="ts">
  import { Button, IconAdd, showPopup } from '@hcengineering/ui'
  import video from '@hcengineering/video'

  import CreateRecording from './CreateRecording.svelte'
  import RecordingPopup from './RecordingPopup.svelte'
  import { openRecordingOverlay } from '..'
</script>

<Button
  icon={video.icon.Video}
  justify={'left'}
  kind={'primary'}
  label={video.string.NewRecording}
  on:click={() => openRecordingOverlay}
/>
