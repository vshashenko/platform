<script lang="ts">
  import { Button, ButtonKind, ButtonSize, closePopup, Row, showPopup } from '@hcengineering/ui'
  import video from '@hcengineering/video'
  import { defaultStreamOptions, MediaStreamer } from '../stream'
  import { VideoPopupCategory } from '../index'

  let allowCamera = true

  const btnProps = {
    kind: 'icon' as ButtonKind,
    iconProps: { size: 'large' as ButtonSize }
  }

  // get camera access
  let videoEl: HTMLVideoElement
  let cam: MediaStream
  let recording = false

  const streamer = new MediaStreamer({
    onStart() {
      recording = true
    },
    onStop() {
      recording = false
    },
    onProgress(sent, total) {
      console.log('transferred', sent, total)
    },
    onSuccess(upload) {
      console.log('success')
      console.log(upload?.url)
      // todo: nav to view page
    },
    onError(err) {
      // todo
    },
    ...defaultStreamOptions
  })

  async function getCam() {
    try {
      cam = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      } as MediaStreamConstraints)
      videoEl.srcObject = cam
      await videoEl.play()
    } catch (error) {
      // todo: 'please allow access to your camera'
    }
  }
  getCam()

  async function stopRecording(abort: boolean) {
    if (cam) {
      cam.getTracks().forEach((t) => t.stop())
    }
    const url = await streamer.stop(abort)
    console.log(url)
  }

  function onClose() {
    console.log('onClose')
    stopRecording(true)
    closePopup(VideoPopupCategory)
  }

  async function record() {
    const share = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    cam.getAudioTracks().forEach((t) => {
      share.addTrack(t)
    })
    streamer.start(share)
  }
</script>

<div class="container">
  {#if allowCamera}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoEl} class="video" controls={false} muted={true}></video>
  {/if}
  <div class="buttons">
    {#if !recording}
      <Button icon={video.icon.Record} on:click={record} {...btnProps} />
    {:else}
      <Button icon={video.icon.Stop} on:click={() => stopRecording(false)} {...btnProps} />
    {/if}
    <Button icon={video.icon.Cancel} on:click={onClose} {...btnProps} />
  </div>
</div>

<style lang="scss">
  .video {
    border-radius: 100%;
    width: 150px;
    height: 150px;
    background-color: black;
    outline: 2px solid var(--theme-dialog-border-color);
  }
  .buttons {
    display: flex;
    width: fit-content;
    justify-content: center;
    align-self: center;
    background-color: var(--theme-dialog-background-color);
    border-radius: var(--large-BorderRadius);
    margin-top: 0.5rem;
    padding: 0.25rem;
    border: 1px solid var(--theme-dialog-border-color);
  }
  .container {
    display: flex;
    flex-direction: column;
    margin: 1rem;
  }
</style>
