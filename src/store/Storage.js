import { makeObservable, action, autorun, observable } from 'mobx'

import Project from './Project'
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

    this.storageEnabled = storageEnabled()
    this.autosaveToBrowser = false
    this.disposer1 = null
    this.holdTextOnScreenTimeoutId = null

    makeObservable(this, {
      autosaveToBrowser: observable,
      setAutosaveToBrowser: action,
    })

    if (this.storageEnabled === false) return

    const prevAutosavePreference = storageGet(Storage.KEYS.AUTOSAVE_TO_BROWSER)
    if (prevAutosavePreference != null) {
      this.autosaveToBrowser = prevAutosavePreference
    } else {
      this.autosaveToBrowser = true
      storageSet(Storage.KEYS.AUTOSAVE_TO_BROWSER, true)
    }
  }

  saveProjectToBrowserLocalStorage = () => {
    clearTimeout(this.holdTextOnScreenTimeoutId)
    this.store.project.saveStatus = Project.STATUSES.SAVING
    const saveObject = this.store.project.generateSaveObject()
    storageSet(Storage.KEYS.PROJECT, saveObject)
    this.holdTextOnScreenTimeoutId = setTimeout(() => {
      this.store.project.saveStatus = Project.STATUSES.SAVED
    }, 500)
  }

  initiateAutosaveLogicOnce() {
    // Only call this function once, when the Root Store is fully setup
    // regardless of Load/Clear/New/Save actions during the users session
    if (!this.autosaveToBrowser) return

    // Auto Load project from storage, if its there
    const projectObj = storageGet(Storage.KEYS.PROJECT)
    if (projectObj) this.store.project.loadFromObject(projectObj)

    this.startAutosavingToBrowser()
  }

  startAutosavingToBrowser() {
    // TODO [4]: autosaving might be cause unnecessary synchrnous load if the project file
    //           is getting large. we should design a solution for this
    this.saveProjectToBrowserLocalStorage() // run once without delay
    this.disposer1 = autorun(this.saveProjectToBrowserLocalStorage, { delay: 400 })
  }

  stopAutosavingToBrowser() {
    if (this.disposer1) this.disposer1()
    this.store.project.saveStatus = Project.STATUSES.UNSAVED
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
