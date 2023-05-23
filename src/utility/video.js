import { createFFmpeg } from '@ffmpeg/ffmpeg'

const BASE64_MARKER = ';base64,'
const FRAME_FILE_PREFIX = 'img_'
const OUTPUT_FILE_PREFIX = 'animation-'

// TODO: make this configurable along with other export options
const FRAME_FILE_TYPE = 'jpeg'
const OUTPUT_FRAME_RATE = 30
const OUTPUT_CODEC = 'libx264'
const OUTPUT_CONTAINER = 'mp4'
const OUTPUT_PIX_FMT = 'yuv420p'

const ffmpeg = createFFmpeg({ log: true })

const writtenImages = []

let canvasToTarget = null
const prepareAPI = async (canvasId) => {
  await ffmpeg.load()
  canvasToTarget = canvasId
}

const writeImage = (imgData, frameNum, fileType) => {
  const paddedNum = `0000000${frameNum}`.slice(-8)
  const fileName = `${FRAME_FILE_PREFIX}${paddedNum}.${fileType}`
  writtenImages.push(fileName)
  return ffmpeg.FS('writeFile', fileName, imgData)
}

const convertDataURIToBinary = (dataURI) => {
  const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
  const base64 = dataURI.substring(base64Index)
  const raw = window.atob(base64)
  const rawLength = raw.length
  const array = new Uint8Array(new ArrayBuffer(rawLength))

  for (let i = 0; i < rawLength; i += 1) {
    array[i] = raw.charCodeAt(i)
  }
  return array
}

const exportOneFrame = (frameNum) => {
  if (!canvasToTarget) return
  const canvas = document.getElementById(canvasToTarget)
  const imgDataUrl = canvas.toDataURL(`image/${FRAME_FILE_TYPE}`)
  const imgData = convertDataURIToBinary(imgDataUrl)
  writeImage(imgData, frameNum, FRAME_FILE_TYPE)
}

const exportVideo = async () => {
  const command = [
    '-framerate', `${OUTPUT_FRAME_RATE}`,
    '-i', `${FRAME_FILE_PREFIX}%08d.${FRAME_FILE_TYPE}`,
    '-c:v', OUTPUT_CODEC,
    '-pix_fmt', OUTPUT_PIX_FMT,
    `out.${OUTPUT_CONTAINER}`,
  ]
  await ffmpeg.run(...command)
  const data = ffmpeg.FS('readFile', 'out.mp4')

  // Clean up the memory used
  writtenImages.forEach((imageName) => {
    ffmpeg.FS('unlink', imageName)
  })
  while (writtenImages.length > 0) {
    writtenImages.pop()
  }
  ffmpeg.FS('unlink', 'out.mp4')

  ffmpeg.exit()
  canvasToTarget = null

  return data
}

const downloadVideo = (videoData) => {
  const videoObjUrl = URL.createObjectURL(new Blob([videoData.buffer], { type: `video/${OUTPUT_CONTAINER}` }))
  const aTag = document.createElement('a')
  aTag.href = videoObjUrl
  const dateStamp = (new Date()).toISOString()
    .replaceAll('-', '')
    .replaceAll('T', '')
    .replaceAll(':', '')
    .slice(0, 12)
  aTag.download = `${OUTPUT_FILE_PREFIX}${dateStamp}.${OUTPUT_CONTAINER}`
  document.body.appendChild(aTag)
  aTag.click()
  URL.revokeObjectURL(videoObjUrl)
  aTag.remove()
}

export {
  prepareAPI,
  exportOneFrame,
  exportVideo,
  downloadVideo,
}
