<script lang="ts">
  import { Button, IconAdd, showPopup } from '@hcengineering/ui'
  import video from '@hcengineering/video'

  import CreateRecording from './CreateRecording.svelte'
  import RecordingPopup from './RecordingPopup.svelte'

  async function newRecording() {
    showPopup(
      RecordingPopup,
      {},
      'movable',
      async (result) => {
        console.log('popup closed with result=', result)
      },
      async (res) => {
        console.log('popup updated with res=', res)
      },
      // todo: We need this popup to exist no matter where you navigate in the platform.
      // currently it goes away if you switch plugin apps.
      // todo: popup should start in bottom-right hand corner
      { category: 'popup', overlay: false }
    )
  }
</script>

<Button
  icon={video.icon.Video}
  justify={'left'}
  kind={'primary'}
  label={video.string.NewRecording}
  on:click={newRecording}
/>
