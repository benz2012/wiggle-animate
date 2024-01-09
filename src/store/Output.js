import {
  browserHasVideoEncoder,
  prepareForExport,
  exportOneFrame,
  exportVideo,
} from '../utility/video'
import { downloadBlob } from '../utility/files'
import { sleep } from '../utility/time'

class Output {
  constructor(store) {
    this.store = store

    this.fileName = ''
    this.browserCanExport = false
    this.isExporting = false

    this.determineExportCapabilities()
  }

  determineExportCapabilities() {
    this.browserCanExport = browserHasVideoEncoder()
    if (!this.browserCanExport) {
      console.warn('This browser is not capable of natively exporting video')
    }
  }

  setFileName(value = null) {
    if (value) {
      this.fileName = value
      return
    }

    const dateStamp = (new Date()).toISOString()
      .replaceAll('-', '')
      .replaceAll('T', '')
      .replaceAll(':', '')
      .slice(0, 12)
    const fileName = `animation-${dateStamp}.webm`
    this.fileName = fileName
  }

  setIsExporting = (value) => { this.isExporting = value }

  export = async () => {
    if (!this.browserCanExport) return

    // TODO [3]: Have progress output displayed Prepare-boolean, Frames-progress, video progress
    // TODO [3]: wrap this whole thing in a giant error handler

    this.store.animation.pause()
    this.store.animation.goToFirst()
    this.store.build.setSelected([])

    this.setIsExporting(true)
    await sleep(1) // give React a tick to render the export-canvas

    const { canvasSize } = this.store.rootContainer
    prepareForExport('export-canvas', canvasSize.width, canvasSize.height, this.store.animation.fps)

    await this.store.animation.animateForExport(exportOneFrame)
    const videoAsBlob = await exportVideo()
    downloadBlob(videoAsBlob, this.fileName)

    this.setIsExporting(false)
    this.store.animation.goToFirst()
  }
}

export default Output
