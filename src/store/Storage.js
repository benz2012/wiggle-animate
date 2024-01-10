import { makeObservable, action, autorun, observable } from 'mobx'

import { storageEnabled, storageSet, storageGet } from '../utility/storage'

class Storage {
  static get KEYS() {
    return {
      AUTOSAVE_TO_BROWSER: 'wiggle.animate.autosaveToBrowser',
      PROJECT: 'wiggle.animate.project',
    }
  }

  constructor(store) {
    this.store = store

    this.autosaveToBrowser = false
    this.disposer1 = null
    makeObservable(this, {
      autosaveToBrowser: observable,
      setAutosaveToBrowser: action,
    })

    if (storageEnabled() === false) return

    const prevAutosavePreference = storageGet(Storage.KEYS.AUTOSAVE_TO_BROWSER)
    if (prevAutosavePreference != null) {
      this.autosaveToBrowser = prevAutosavePreference
    } else {
      this.autosaveToBrowser = true
      storageSet(Storage.KEYS.AUTOSAVE_TO_BROWSER, true)
    }

    if (!this.autosaveToBrowser) return

    // Auto Load project from storage, if its there
    const projectObj = storageGet(Storage.KEYS.PROJECT)
    if (projectObj) this.store.project.loadFromObject(projectObj)

    this.startAutosavingToBrowser()
  }

  saveProjectToBrowserLocalStorate = () => {
    const saveObject = this.store.project.generateSaveObject()
    storageSet(Storage.KEYS.PROJECT, saveObject)
  }

  startAutosavingToBrowser() {
    this.saveProjectToBrowserLocalStorate() // run once without delay
    this.disposer1 = autorun(this.saveProjectToBrowserLocalStorate, { delay: 3000 })
  }

  stopAutosavingToBrowser() {
    if (this.disposer1) this.disposer1()
  }

  setAutosaveToBrowser(value) {
    storageSet(Storage.KEYS.AUTOSAVE_TO_BROWSER, value)
    this.autosaveToBrowser = value
    if (value === true) {
      this.startAutosavingToBrowser()
    } else {
      this.stopAutosavingToBrowser()
      localStorage.removeItem(Storage.KEYS.PROJECT)
    }
  }
}

export default Storage
