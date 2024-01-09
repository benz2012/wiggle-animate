import { makeAutoObservable } from 'mobx'

import { browserFonts, loadFont } from '../utility/fonts'

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

  save() {
    const entireTreeAsObject = this.store.rootContainer.toPureObject()
    console.log(entireTreeAsObject)
  }
}

export default Project
