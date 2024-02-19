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

class PNGEncoder {
  constructor(canvasId, width, height, expectedFilename) {
    this.canvasToTarget = canvasId
    this.width = width
    this.height = height
    this.filename = expectedFilename

    this.zip = new JSZip()
    this.imagesFolder = this.zip.folder(this.filename)
  }

  async encodeOneFrame(frameNum) {
    const canvas = document.getElementById(this.canvasToTarget)
    const filename = `${this.filename}.${frameNum.toString().padStart(5, '0')}.png`
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        this.imagesFolder.file(filename, blob)
        resolve()
      }, 'image/png')
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
    this.pngEncoder = null
  }

  prepareForExport(errorCallback, canvasId, width, height, frameRate, encodingOptions, expectedFilename) {
    this.canvasToTarget = canvasId
    this.outputFrameRate = frameRate
    this.encodingOptions = encodingOptions

    if (encodingOptions.container === 'png') {
      this.pngEncoder = new PNGEncoder(canvasId, width, height, expectedFilename)
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
    // BUG: Safari isn't letting the canvas render on each frame
    //      as if it sees consequitive canvas updates and has some sort of
    //      internal debounce that waits a few mills before drawing the canvas updates
    if (this.pngEncoder) {
      await this.pngEncoder.encodeOneFrame(frameNum)
      return
    }

    const canvas = document.getElementById(this.canvasToTarget)
    const millisecondsPerFrame = 1000 / this.outputFrameRate
    const microsecondsPerFrame = millisecondsPerFrame * 1000
    const timestampOfFrame = Math.round((frameNum - 1) * microsecondsPerFrame)

    const frame = new VideoFrame(canvas, { timestamp: timestampOfFrame })
    await this.videoEncoder.encode(frame, { keyFrame: frameNum % 60 === 0 })
    frame.close()
  }

  async finalizeVideo() {
    if (this.pngEncoder) {
      const pngSequenceBlob = await this.pngEncoder.finalizeSequence()
      this.pngEncoder = null
      return pngSequenceBlob
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
