import { prepareForExport, exportOneFrame, exportVideo, downloadBlob } from '../utility/video'
import { sleep } from '../utility/time'

class Output {
  constructor(store) {
    this.store = store

    this.fileName = ''
    this.isExporting = false
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
    // TODO [3]: Have progress output displayed Prepare-boolean, Frames-progress, video progress
    // TODO [3]: wrap this whole thing in a giant error handler

    this.store.animation.pause()
    this.store.animation.goToFirst()
    this.store.build.setSelected([])

    this.setIsExporting(true)
    await sleep(1) // give React a tick to render the export-canvas

    const { canvasSize } = this.store.rootContainer
    const prepared = prepareForExport('export-canvas', canvasSize.width, canvasSize.height, this.store.animation.fps)
    if (prepared) {
      await this.store.animation.animateForExport(exportOneFrame)
      const videoAsBlob = await exportVideo()
      downloadBlob(videoAsBlob, this.fileName)
    } else {
      // TODO [2]: tell the user that we can't export using their browser
      // do this by running prepare when we open the modal, and only enabling the button once we know
      console.warn('Error: This browser is not preparred/capable of exporting video in the way the developer wants')
    }

    this.setIsExporting(false)
    this.store.animation.goToFirst()
  }
}

export default Output
