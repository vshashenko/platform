<script lang="ts">
  import {
    FocusHandler,
    CircleButton,
    Grid,
    StylishEdit,
    DropdownLabels,
    DropdownTextItem,
    Button
  } from '@hcengineering/ui'
  import { Card } from '@hcengineering/presentation'
  import { closePopup, createFocusManager } from '@hcengineering/ui'
  import video from '@hcengineering/video'
  import { VideoStreamMerger } from 'video-stream-merger'
  import type { ConstructorOptions, AddStreamOptions } from 'video-stream-merger'
  import * as tus from 'tus-js-client'
  import { log2client, log2server, logerr } from '../utils/log'

  const settingsItems: DropdownTextItem[] = [
    { id: '1080p', label: '1080p' },
    { id: '720p', label: '720p' }
    // etc
  ]

  const manager = createFocusManager()

  const onClose = async () => {
    closePopup()
  }
  type ReadResult = ReadableStreamReadResult<Blob>
  let title: string = 'New recording ' + new Date().toLocaleDateString()
  let merger: VideoStreamMerger
  let cam: MediaStream
  let share: MediaStream
  let recording = false
  let waiting = false
  let recorder: MediaRecorder
  let onDataAvailable: null | ((p: Promise<ReadResult>) => void) = null
  const chunks: Blob[] = []
  const chunkSize = 10000
  let videoElement: HTMLVideoElement
  let canSave = false

  let upload: tus.Upload
  const tusUploadOpts: Partial<tus.UploadOptions> = {
    endpoint: 'http://localhost:1080',
    // resume: false,
    chunkSize,
    retryDelays: [0, 1000, 3000, 5000],
    uploadLengthDeferred: true,
    metadata: {
      filename: title,
      filetype: 'video/webm'
    },
    onError(err) {
      logerr('', err)
      // probably want to put up an error to let user know the recording stopped
      // or have a way to record offline
      stopRecording()
    },
    onProgress(sent, total) {
      log2server('sent', sent, ' // total', total)
    },
    onSuccess() {
      log2client('success')
      // set the video's url from upload.url
      // allow user to download the file
      videoElement.src = upload.url ?? ''
      videoElement.controls = true
    }
  }

  const onclick = async (): Promise<void> => {
    if (!recording) {
      await record()
    } else {
      stopRecording()
    }
  }

  async function initStreams() {
    try {
      cam = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      } as MediaStreamConstraints)
      const camInfo = cam.getTracks()?.[0].getSettings()
      camInfo.width = 1920
      camInfo.height = 1080
      share = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      merger = new VideoStreamMerger({
        width: camInfo.width,
        height: camInfo.height
      } as ConstructorOptions)
      merger.addStream(share, {} as AddStreamOptions)
      merger.addStream(cam, {
        width: 100,
        height: 100,
        x: 25,
        y: merger.height - 125
        //todo: use draw function to clip the camera stream canvas into a circle
      } as AddStreamOptions)
      return true
    } catch (e) {
      console.warn('Could not get streams', e)
      return false
    }
  }

  async function record() {
    waiting = true
    if (!(await initStreams())) {
      console.error('initStreams failed!')
      stopRecording()
      return
    }
    merger.start()
    if (merger.result !== null) {
      recorder = new MediaRecorder(merger.result)
      recorder.onstop = () => {
        recording = false
      }
      recorder.ondataavailable = (ev) => {
        chunks.push(ev.data)
        if (onDataAvailable !== null) {
          onDataAvailable(readableRecorder.read())
          onDataAvailable = null
        }
      }
      recorder.start(1000)
      recording = true
    } else {
      console.error('Merger result was null')
      return false
    }
    const readableRecorder = {
      read(): Promise<ReadResult> {
        if (!recording && chunks.length === 0) {
          return Promise.resolve({ done: true })
        }
        if (chunks.length > 0) {
          return Promise.resolve({ value: chunks.shift()!, done: false })
        }
        return new Promise((resolve) => {
          onDataAvailable = resolve
        })
      }
    }

    upload = new tus.Upload(readableRecorder, tusUploadOpts)
    upload.start()
  }

  function stopRecording() {
    cam?.getTracks().forEach((t) => t.stop())
    share?.getTracks().forEach((t) => t.stop())
    merger?.stop()
    recorder?.stop()
    recording = false
  }
</script>

<FocusHandler {manager} />

<Card {canSave} label={video.string.NewRecording} okAction={() => alert('todo!')} on:close={onClose}>
  <div class="video-column">
    <video bind:this={videoElement} class="video"></video>
  </div>
  <Grid>
    <div class="edit-column">
      <StylishEdit disabled={recording || waiting} label={video.string.Name} value={title} />
    </div>
    <!-- this will probably end up being a "show more" popup -->
    <div class="config-column">
      <Button
        kind="ghost"
        icon={video.icon.Settings}
        iconProps={{ size: 'large' }}
        on:click={() => alert('todo')}
        size="large"
      />
      <!-- <DropdownLabels label={video.string.VideoSettings} items={settingsItems}></DropdownLabels> -->
    </div>
    <div class="record-column">
      {#if !recording}
        <Button
          icon={video.icon.Record}
          iconProps={{ size: 'x-large', fill: 'red' }}
          bind:disabled={waiting}
          on:click={onclick}
          size="x-large"
          kind="icon"
        />
      {:else}
        <Button icon={video.icon.Stop} bind:disabled={waiting} on:click={onclick} size="x-large" kind="icon" />
      {/if}
    </div>
  </Grid>
</Card>

<style lang="scss">
  .edit-column {
    grid-column: 1 / span 2;
    grid-row: 2;
  }
  .config-column {
    grid-column: 3;
    grid-row: 2;
  }
  .record-column {
    grid-column: 4;
    grid-row: 2;

    .icon-button {
      background-color: red;
    }
  }
  .video-column {
    grid-column: 1 / span 4;
    grid-row: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .video {
    background: black;
    border-radius: 0.75rem;
    // This should probably be dynamic.
    width: 640px;
    height: 480px;
  }
</style>
