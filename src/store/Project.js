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
    this.fonts = []
    this.initialize()

    makeAutoObservable(this)
  }

  initialize() {
    this.fonts = [...browserFonts]
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

  toPureObject() {
    return {
      version: process.env.REACT_APP_VERSION,
      name: this.name,
      fonts: toJS(this.nonBrowserFonts),
    }
  }

  fromPureObject({ name, fonts }) {
    // NOTE: This is where we would handle version mapping/migrations/etc if needed
    // e.g. if (version !== process.env.REACT_APP_VERSION)
    this.initialize()
    this.name = name
    this.fonts.push(...fonts)
  }

  generateSaveObject() {
    // TODO [4]: Explicity minify key names, where possible, to make file smaller
    return {
      project: this.toPureObject(),
      animation: this.store.animation.toPureObject(),
      tree: this.store.rootContainer.toPureObject(),
    }
  }

  save() {
    const output = JSON.stringify(this.generateSaveObject())
    const fileBlob = new Blob([output], { type: 'application/json' })
    downloadBlob(fileBlob, `${this.name || 'Untitled Animation Project'}.json`)
  }

  load(fileObject) {
    fileObject.text().then((jsonStr) => {
      const pureObject = JSON.parse(jsonStr)
      this.loadFromObject(pureObject)
    })
  }

  loadFromObject(pureObject) {
    this.fromPureObject(pureObject.project)
    this.store.animation.fromPureObject(pureObject.animation)
    this.store.rootContainer.fromPureObject(pureObject.tree)
  }
}

export default Project
