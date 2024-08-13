<script lang="ts">
  import { Button, ButtonKind, ButtonSize, closePopup, Row, showPopup } from '@hcengineering/ui'
  import video from '@hcengineering/video'
  import { defaultStreamOptions, MediaStreamer } from '../stream'
  import { microphone as micStore, camera as cameraStore, recordingState } from '../utils/recordingState'
  import { onDestroy } from 'svelte'

  $: allowCamera = false
  $: camera = null as MediaStream | null
  cameraStore.subscribe(async (deviceId) => {
    if (camera) {
      camera.getTracks().forEach((t) => t.stop())
    }
    if (deviceId === 'none') {
      camera = null
      allowCamera = false
    } else {
      allowCamera = true
      try {
        camera = await navigator.mediaDevices.getUserMedia({
          video: { deviceId }
        } as MediaStreamConstraints)
      } catch (error) {
        console.error(error)
        // todo: 'please allow access to your camera'
      }
    }
    try {
      videoEl.srcObject = camera
      await videoEl.play()
    } catch (e) {
      // do nothing
    }
  })

  $: microphone = null as MediaStream | null
  micStore.subscribe(async (deviceId) => {
    if (microphone) {
      microphone.getTracks().forEach((t) => t.stop())
    }
    if (deviceId === 'none') {
      microphone = null
    } else {
      try {
        microphone = await navigator.mediaDevices.getUserMedia({ audio: { deviceId } })
      } catch (error) {
        console.error(error)
        // todo: 'please allow access to your microphone'
      }
    }
  })

  recordingState.subscribe(async (state) => {
    if (state === 'init') {
      // do nothing
    } else if (state === 'countdown') {
      await showCountdown()
    } else if (state === 'recording') {
      await record()
    } else if (state === 'paused') {
      // todo
    } else if (state === 'cancelled') {
      await onClose()
    } else if (state === 'finished') {
      // redirect to completed recording if applicable.
      // may open in new tab
    }
  })

  async function showCountdown() {
    // todo
    await record()
  }

  const btnProps = {
    kind: 'icon' as ButtonKind,
    iconProps: { size: 'large' as ButtonSize }
  }

  // get camera access
  let videoEl: HTMLVideoElement
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

  async function stopRecording(abort: boolean) {
    if (camera) {
      camera.getTracks().forEach((t) => t.stop())
    }
    if (microphone) {
      microphone.getTracks().forEach((t) => t.stop())
    }
    const url = await streamer.stop(abort)
  }

  async function onClose() {
    await stopRecording(true)
    closePopup('recordingPopup')
  }

  onDestroy(onClose)

  async function record() {
    const share = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    })
    microphone?.getAudioTracks().forEach((t) => {
      share.addTrack(t)
    })
    streamer.start(share)
  }
</script>

<div class="container">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this={videoEl} class="video" style={!allowCamera ? 'display:none' : ''} controls={false} muted={true}
  ></video>
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
