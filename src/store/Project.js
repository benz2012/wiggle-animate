import { makeAutoObservable, toJS } from 'mobx'

import { browserFonts, loadFont } from '../utility/fonts'
import { downloadBlob } from '../utility/files'
import { replaceKeysInObj } from '../utility/object'

// TODO [3]: Project Name setting & display
// TODO [3]: Project saving & save status

class Project {
  static get STATUSES() {
    return {
      CLEAN: 'clean slate',
      UNSAVED: 'unsaved',
      SAVING: 'saving',
      SAVED: 'saved',
      LOADED: 'loaded',
      ERROR: 'error saving', // has no use, currently
    }
  }

  constructor(store) {
    this.store = store

    this.name = ''
    this._saveStatus = Project.STATUSES.CLEAN
    this.fonts = []
    this.numFontsLoaded = 0
    this.initialize()

    makeAutoObservable(this)
  }

  initialize() {
    this.fonts = [...browserFonts]
    this.numFontsLoaded = browserFonts.length
  }

  reInitializeAll() {
    this.name = ''
    this.saveStatus = Project.STATUSES.CLEAN
    this.initialize()

    const { actionStack, rootContainer, build, animation, propertyEditor, keyframeEditor } = this.store

    actionStack.reset()

    const RootContainer = rootContainer.constructor
    rootContainer.canvasPosition = RootContainer.INITIAL.canvasPosition
    rootContainer._canvasScale = RootContainer.INITIAL.canvasScale
    rootContainer.canvasSize = RootContainer.INITIAL.canvasSize
    rootContainer.canvasFill = RootContainer.INITIAL.canvasFill
    rootContainer.setCanvasToBestFit()

    const Animation = animation.constructor
    animation.frames = Animation.INITIAL.frames
    animation.firstFrame = Animation.FIRST
    animation.lastFrame = Animation.INITIAL.frames
    animation.fps = Animation.INITIAL.fps
    animation.now = Animation.FIRST
    animation.playing = Animation.INITIAL.playing
    animation.mode = Animation.PLAYBACK_MODES.LOOP

    const PropertyEditor = propertyEditor.constructor
    propertyEditor.position = PropertyEditor.INITIAL.position
    propertyEditor.hiddenGroups = PropertyEditor.INITIAL.hiddenGroups
    propertyEditor.pairedVectors = PropertyEditor.INITIAL.pairedVectors

    build.setSelected([])
    keyframeEditor.setSelected([])

    // Finally, cleanse the Tree
    rootContainer._children = RootContainer.INITIAL.children
    rootContainer._sortOrder = RootContainer.INITIAL.sortOrder
  }

  // We use a get/set here since saveStatus is touched inside of a callback, so to enables a proper mobx
  // action to be used in that "this" context
  get saveStatus() { return this._saveStatus }
  set saveStatus(newValue) {
    this._saveStatus = newValue
  }

  incrementFontsLoaded = () => {
    this.numFontsLoaded += 1
  }

  addFonts(listOfFonts) {
    this.fonts.push(...listOfFonts)
    listOfFonts.forEach((font) => {
      loadFont(font).then(this.incrementFontsLoaded)
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

  get fontsAreLoading() {
    return this.fonts.length !== this.numFontsLoaded
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
    this.addFonts(fonts)
  }

  generateSaveObject() {
    const pureObject = {
      project: this.toPureObject(),
      animation: this.store.animation.toPureObject(),
      tree: this.store.rootContainer.toPureObject(),
    }
    // Small obfuscation to save some bytespace
    const saveObject = replaceKeysInObj(pureObject, {
      className: 'c',
      value: 'v',
      keyframes: 'k',
    })
    return saveObject
  }

  save(fileName) {
    const output = JSON.stringify(this.generateSaveObject())
    const fileBlob = new Blob([output], { type: 'application/json' })
    downloadBlob(fileBlob, `${fileName}.json`)
    this.saveStatus = Project.STATUSES.SAVED
  }

  load(fileObject) {
    fileObject.text().then((jsonStr) => {
      const pureObject = JSON.parse(jsonStr)
      this.loadFromObject(pureObject)
    }).catch(() => {
      // TODO [4]: Communicate the error with loading the project, invalid JSON or what-have-you
    })
  }

  loadFromObject(saveObject) {
    this.reInitializeAll()

    const pureObject = replaceKeysInObj(saveObject, {
      c: 'className',
      v: 'value',
      k: 'keyframes',
    })
    this.fromPureObject(pureObject.project)
    this.store.animation.fromPureObject(pureObject.animation)
    this.store.rootContainer.fromPureObject(pureObject.tree)

    this.saveStatus = Project.STATUSES.LOADED
  }
}

export default Project
