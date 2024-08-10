<script lang="ts">
  import { Button, ButtonKind, ButtonSize, closePopup, Row, showPopup } from '@hcengineering/ui'
  import video from '@hcengineering/video'
  import { defaultStreamOptions, MediaStreamer } from '../stream'
  import { defaultRecordingOptions, RecordingOptions, RecordingState } from '..'
  import { onDestroy } from 'svelte'
  import { Writable } from 'svelte/store'

  export let recordingState: Writable<RecordingState>

  let options = defaultRecordingOptions
  recordingState.subscribe((val) => {
    console.log('UPDATE', val)
    options = val.options ?? options
    const state = val.state
    if (state === 'init') {
      // make sure all local state is set to initial status
    } else if (state === 'countdown') {
      // initialize countdown
    } else if (state === 'recording') {
      record()
    } else if (state === 'paused') {
      // todo
    } else if (state === 'cancelled') {
      onClose()
    } else if (state === 'finished') {
      // redirect to completed recording if applicable.
      // may open in new tab
    }
  })

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
    stopRecording(true)
    closePopup('recordingPopup')
  }

  onDestroy(onClose)

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

<div class="container" on:startRecording={record}>
  {#if allowCamera}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoEl} class="video" controls={false} muted={true}></video>
  {/if}
  <div class="buttons">
    {#if !recording}
      <Button
        icon={video.icon.Record}
        on:click={() => {
          record()
        }}
        {...btnProps}
      />
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
