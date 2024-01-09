import { makeAutoObservable, toJS } from 'mobx'

import { browserFonts, loadFont } from '../utility/fonts'
import { downloadBlob } from '../utility/files'

// TODO [3]: Project Name setting & display
// TODO [3]: Project saving & save status

class Project {
  constructor(store) {
    this.store = store

    this.name = ''
    this.saveStatus = 'unknown'
    this.fonts = [...browserFonts]

    makeAutoObservable(this)
  }

  addFonts(listOfFonts) {
    this.fonts.push(...listOfFonts)
    listOfFonts.forEach((font) => {
      loadFont(font)
    })
  }

  get fontFamilies() {
    return this.fonts.reduce((accum, font) => {
      if (accum.includes(font.name) === true) return accum
      return [...accum, font.name]
    }, []).sort()
  }

  get nonBrowserFonts() {
    return this.fonts.slice(browserFonts.length)
  }

  save() {
    const finalPureObject = {
      version: process.env.REACT_APP_VERSION,
      name: this.name,
      fonts: toJS(this.nonBrowserFonts),
      animation: this.store.animation.toPureObject(),
      tree: this.store.rootContainer.toPureObject(),
    }
    const output = JSON.stringify(finalPureObject)
    const fileBlob = new Blob([output], { type: 'application/json' })
    downloadBlob(fileBlob, `${this.name || 'Animation Project - Untitled'}.json`)
  }
}

export default Project
