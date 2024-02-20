import { makeObservable, observable, action } from 'mobx'

import { browserHasVideoEncoder, VideoExporter } from '../utility/video'
import { downloadBlob } from '../utility/files'
import { sleep } from '../utility/time'
import { ENCODING_OPTIONS } from '../utility/encoding'

class Output {
  constructor(store) {
    this.store = store

    this.fileName = ''
    this.browserHasVideoEncoder = false
    this.isExporting = false
    this.exportProgress = null
    this.errorMessage = ''

    this.videoExporter = new VideoExporter()
    this.encodingOption = ENCODING_OPTIONS[0]

    this.determineExportCapabilities()

    makeObservable(this, {
      isExporting: observable,
      exportProgress: observable,
      encodingOption: observable,
      setIsExporting: action,
      setEncodingOption: action,
      setExportProgress: action,
    })
  }

  determineExportCapabilities() {
    this.browserHasVideoEncoder = browserHasVideoEncoder()
    if (!this.browserHasVideoEncoder) {
      console.warn('This browser is not capable of natively exporting video')
    }
  }

  setFileName(value = null) {
    if (value) {
      this.fileName = value
      return
    }

    let prefix = 'animation'
    if (this.store.project.name) {
      prefix = this.store.project.name.replaceAll(' ', '_')
    }

    const dateStamp = (new Date()).toISOString()
      .replaceAll('-', '')
      .replaceAll('T', '')
      .replaceAll(':', '')
      .slice(0, 12)
    const fileName = `${prefix}-${dateStamp}`
    this.fileName = fileName
  }

  setIsExporting = (value) => { this.isExporting = value }

  setEncodingOption = (value) => { this.encodingOption = value }

  setExportProgress = (value) => { this.exportProgress = value }

  handleError(error) {
    const errorSentance = `Error during export: ${error.name} -- ${error.message}`
    console.error(errorSentance)
    this.errorMessage = errorSentance
  }

  export = async () => {
    this.store.animation.pause()
    this.store.animation.goToFirst()
    this.store.build.setSelected([])

    this.setExportProgress(0)
    this.setIsExporting(true)
    await sleep(1) // give React a tick to render the export-canvas

    try {
      const { canvasSize } = this.store.rootContainer
      let preparationFailure = ''
      this.videoExporter.prepareForExport(
        (err) => { preparationFailure = err },
        'export-canvas',
        canvasSize.width,
        canvasSize.height,
        this.store.animation.fps,
        this.encodingOption,
        this.fileName,
      )

      await sleep(100) // give VideoEncoder a moment to fail preparations
      if (preparationFailure) throw preparationFailure

      await this.store.animation.animateForExport(this.videoExporter.encodeOneFrame.bind(this.videoExporter))
      const videoAsBlob = await this.videoExporter.finalizeVideo()
      let filename = `${this.fileName}.${this.encodingOption.container}`
      if (this.encodingOption.container === 'png') {
        filename = `${this.fileName}.zip`
      }

      downloadBlob(videoAsBlob, filename)
    } catch (error) {
      this.handleError(error)
    }

    this.setIsExporting(false)
    this.store.animation.goToFirst()
  }
}

export default Output
