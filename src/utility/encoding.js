// I would love to use 4:2:2 subsampling but it's not supported in any browser's implementation of VideoEncoder yet

const ENCODING_OPTIONS = [
  {
    container: 'png',
    containerName: 'png sequence',
    containerMime: 'image/png',
    supportsAlpha: true,
    requiresVideoEncoder: false,
    imageSequence: true,
  },
  {
    container: 'jpg',
    containerName: 'jpeg sequence',
    containerMime: 'image/jpeg',
    quality: 1,
    supportsAlpha: false,
    requiresVideoEncoder: false,
    imageSequence: true,
  },
  {
    container: 'mp4',
    containerName: 'mp4',
    containerMime: 'h264',
    codec: 'AVC',
    codecName: 'H.264',
    codecMuxer: 'avc',
    // 4d0029 = AVC Main Profile Level 4.1
    // for more, see https://dmnsgn.github.io/media-codecs/
    codecParameters: 'avc1.4d0029',
    supportsAlpha: false,
    requiresVideoEncoder: true,
  },
  {
    container: 'webm',
    containerName: 'webm',
    containerMime: 'webm',
    codec: 'AV1',
    codecName: 'AV1',
    codecMuxer: 'V_AV1',
    //  0 = Main profile; supports YUV 4:2:0
    // 09 = Level 4.1, see see https://aomediacodec.github.io/av1-spec/#levels
    // M  = main teir ??
    // 08 = 8-bits per channel
    // 0  = not monochrome
    codecParameters: 'av01.0.09M.08.0',
    supportsAlpha: false,
    requiresVideoEncoder: true,
  },
]

// eslint-disable-next-line import/prefer-default-export
export { ENCODING_OPTIONS }
