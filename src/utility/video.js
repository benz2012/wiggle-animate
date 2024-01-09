/* global VideoEncoder, VideoFrame */

import { Muxer, ArrayBufferTarget } from 'webm-muxer'

// TODO [3]: make this a class
// TODO [3]: make these configurable along with other export options
const MUXER_CODEC = 'V_VP9'
const OUTPUT_CONTAINER = 'webm'

const CODEC_PROFILE = '00' // Only 4:2:0. Allows only 8 bits per color component.
const CODEC_LEVEL = '41' // 4.1, see https://www.webmproject.org/vp9/levels/
const CODEC_BIT_DEPTH = '08' // 8-bits per channel
const WEBM_CODEC_PARAMS = `vp09.${CODEC_PROFILE}.${CODEC_LEVEL}.${CODEC_BIT_DEPTH}`

const browserHasVideoEncoder = () => {
  if ('VideoEncoder' in window) return true
  return false
}

let canvasToTarget = null
let outputFrameRate = null
let muxer = null
let videoEncoder = null
const prepareForExport = (canvasId, width, height, frameRate) => {
  canvasToTarget = null
  outputFrameRate = null
  muxer = null
  videoEncoder = null

  canvasToTarget = canvasId
  outputFrameRate = frameRate

  muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: MUXER_CODEC,
      width,
      height,
    },
  })

  videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    // eslint-disable-next-line
    error: (err) => console.error(err),
  })

  videoEncoder.configure({
    codec: WEBM_CODEC_PARAMS,
    width,
    height,
  })
}

const exportOneFrame = async (frameNum) => {
  // BUG: Safari isn't letting the canvas render on each frame
  //      as if it sees consequitive canvas updates and has some sort of
  //      internal debounce that waits a few mills before drawing the canvas updates
  const canvas = document.getElementById(canvasToTarget)
  const millisecondsPerFrame = 1000 / outputFrameRate
  const microsecondsPerFrame = millisecondsPerFrame * 1000
  const timestampOfFrame = Math.round((frameNum - 1) * microsecondsPerFrame)

  const frame = new VideoFrame(canvas, { timestamp: timestampOfFrame })
  await videoEncoder.encode(frame, { keyFrame: frameNum % 60 === 0 })
  frame.close()
}

const exportVideo = async () => {
  await videoEncoder.flush()
  muxer.finalize()
  const videoAsBlob = new Blob([muxer.target.buffer], { type: `video/${OUTPUT_CONTAINER}` })
  return videoAsBlob
}

export {
  browserHasVideoEncoder,
  prepareForExport,
  exportOneFrame,
  exportVideo,
}
