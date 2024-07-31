<script lang="ts">
  import { Button, ButtonKind, ButtonSize, closePopup, Row, showPopup } from '@hcengineering/ui'
  import ui from '@hcengineering/ui'
  import ButtonGroup from '@hcengineering/ui/src/components/ButtonGroup.svelte'
  import ErrorPopup from '@hcengineering/ui/src/components/ErrorPopup.svelte'
  import Grid from '@hcengineering/ui/src/components/Grid.svelte'
  import Close from '@hcengineering/ui/src/components/icons/Close.svelte'
  import video from '@hcengineering/video'
  import { defaultStreamOptions, MediaStreamer } from '../stream'
  import { AddStreamOptions, ConstructorOptions, VideoStreamMerger } from 'video-stream-merger'

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
    closePopup()
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
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this={videoEl} class="video" controls={false} muted={true}></video>
  <div class="buttons">
    {#if !recording}
      <Button icon={video.icon.Record} on:click={record} {...btnProps} />
    {:else}
      <Button icon={video.icon.Stop} on:click={() => stopRecording(false)} {...btnProps} />
    {/if}
    <Button
      icon={video.icon.Settings}
      on:click={() => {
        alert('todo: settings popup')
      }}
      {...btnProps}
    />
    <Button icon={Close} on:click={onClose} {...btnProps} />
  </div>
</div>

<style lang="scss">
  .video {
    border-radius: 100%;
    width: 150px;
    height: 150px;
    background-color: black;
  }
  .buttons {
    display: flex;
    width: 100%;
    justify-content: center;
  }
  .container {
    display: flex;
    flex-direction: column;
  }
</style>
