// I would love to use 4:2:2 subsampling but it's not supported in any browser's implementation of VideoEncoder yet

const ENCODING_OPTIONS = [
  {
    container: 'png',
    containerName: 'png sequence',
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
  },
  {
    container: 'webm',
    containerName: 'webm',
    containerMime: 'webm',
    codec: 'VP9',
    codecName: 'VP9',
    codecMuxer: 'V_VP9',
    // 00 = only supports 4:2:0 chroma subsampling, only 8 bits.
    // 41 = Level 4.1, see see https://www.webmproject.org/vp9/levels/
    // 08 = 8-bits per channel
    codecParameters: 'vp09.00.41.08',
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
  },
]

// eslint-disable-next-line import/prefer-default-export
export { ENCODING_OPTIONS }
