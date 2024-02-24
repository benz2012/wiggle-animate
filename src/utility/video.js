/* eslint-disable max-classes-per-file */
/* global VideoEncoder, VideoFrame */

import * as webm from 'webm-muxer'
import * as mp4 from 'mp4-muxer'
import JSZip from 'jszip'

const containerMuxerMap = {
  webm,
  mp4,
}

// TODO [3]: Support exporting directly to file via FileSystemWritableFileStreamTarget

const browserHasVideoEncoder = () => {
  if ('VideoEncoder' in window) return true
  return false
}

class ImageSequenceEncoder {
  constructor(canvasId, width, height, encodingOptions, expectedFilename) {
    this.canvasToTarget = canvasId
    this.width = width
    this.height = height
    this.filename = expectedFilename
    this.container = encodingOptions.container
    this.mimeType = encodingOptions.containerMime
    this.quality = encodingOptions.quality ?? undefined

    this.zip = new JSZip()
    this.imagesFolder = this.zip.folder(this.filename)
  }

  async encodeOneFrame(frameNum) {
    const canvas = document.getElementById(this.canvasToTarget)
    const filename = `${this.filename}.${frameNum.toString().padStart(5, '0')}.${this.container}`
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        this.imagesFolder.file(filename, blob)
        resolve()
      }, this.mimeType, this.quality)
    })
  }

  async finalizeSequence() {
    const blob = await this.zip.generateAsync({ type: 'blob' })
    return blob
  }
}

class VideoExporter {
  constructor() {
    this.canvasToTarget = null
    this.outputFrameRate = null
    this.encodingOptions = null
    this.muxer = null
    this.videoEncoder = null
    this.imageSequenceEncoder = null
  }

  prepareForExport(errorCallback, canvasId, width, height, frameRate, encodingOptions, expectedFilename) {
    this.canvasToTarget = canvasId
    this.outputFrameRate = frameRate
    this.encodingOptions = encodingOptions

    if (encodingOptions.imageSequence) {
      this.imageSequenceEncoder = new ImageSequenceEncoder(canvasId, width, height, encodingOptions, expectedFilename)
      return
    }

    const muxerClass = containerMuxerMap[this.encodingOptions.container]

    this.muxer = new muxerClass.Muxer({
      target: new muxerClass.ArrayBufferTarget(),
      video: {
        codec: this.encodingOptions.codecMuxer,
        width,
        height,
        frameRate: this.outputFrameRate,
      },
      fastStart: false,
    })

    this.videoEncoder = new VideoEncoder({
      output: (chunk, meta) => this.muxer.addVideoChunk(chunk, meta),
      error: errorCallback,
    })

    this.videoEncoder.configure({
      codec: this.encodingOptions.codecParameters,
      width,
      height,
      framerate: this.outputFrameRate,
      bitrate: 10_000_000,
      bitrateMode: 'variable',
      latencyMode: 'quality',
    })
  }

  async encodeOneFrame(frameNum) {
    if (this.imageSequenceEncoder) {
      await this.imageSequenceEncoder.encodeOneFrame(frameNum)
      return
    }

    const canvas = document.getElementById(this.canvasToTarget)
    const millisecondsPerFrame = 1000 / this.outputFrameRate
    const microsecondsPerFrame = millisecondsPerFrame * 1000
    const timestampOfFrame = Math.round((frameNum - 1) * microsecondsPerFrame)

    const frame = new VideoFrame(canvas, {
      timestamp: timestampOfFrame,
      duration: microsecondsPerFrame,
    })
    await this.videoEncoder.encode(frame, { keyFrame: frameNum % 60 === 0 })
    frame.close()
  }

  async finalizeVideo() {
    if (this.imageSequenceEncoder) {
      const imageSequenceBlob = await this.imageSequenceEncoder.finalizeSequence()
      this.imageSequenceEncoder = null
      return imageSequenceBlob
    }

    await this.videoEncoder.flush()
    this.muxer.finalize()
    const videoAsBlob = new Blob([this.muxer.target.buffer], { type: `video/${this.encodingOptions.containerMime}` })

    // Null everything out to clear memory
    this.canvasToTarget = null
    this.outputFrameRate = null
    this.encodingOptions = null
    this.muxer = null
    this.videoEncoder = null

    return videoAsBlob
  }
}

export {
  browserHasVideoEncoder,
  VideoExporter,
}
