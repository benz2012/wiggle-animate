import { observable, makeObservable, action, computed } from 'mobx'
// import { autorun } from 'mobx'

import RootContainer from './lib/structure/RootContainer'
import Container from './lib/structure/Container'
import Vector2 from './lib/structure/Vector2'
import Size from './lib/structure/Size'
import Rectangle from './lib/shapes/Rectangle'
import Ellipse from './lib/shapes/Ellipse'
import Text from './lib/shapes/Text'
import Polygon from './lib/shapes/Polygon'
import Line from './lib/shapes/Line'
import Path from './lib/shapes/Path'
import Animation from './lib/animation/Animation'
import Angle from './lib/structure/Angle'
import { prepareForExport, exportOneFrame, exportVideo, downloadBlob } from './utility/video'
// import { storageEnabled } from './utility/storage'
import { sleep } from './utility/time'

class RootStore {
  constructor() {
    // Auto Save & Auto Load
    // if (storageEnabled()) {
    //   const projectObj = localStorage.getItem('micrograph.project')
    //   if (projectObj) {
    //     setTimeout(() => {
    //       this.project.load(projectObj)
    //     }, 100)
    //   }

    //   autorun(() => {
    //     const projectAsJSON = this.project.save()
    //     localStorage.setItem('micrograph.project', projectAsJSON)
    //   }, { delay: 300 })
    // }

    this.DPR = window.devicePixelRatio || 1

    this.rootContainer = new RootContainer(this)

    this.project = {
      name: '',
      saveStatus: 'unknown',
      isExporting: false,
    }

    this.build = {
      tool: '',
      pointerPosition: null,
      activePath: null,
      selectedIds: [],
      hoveredId: null,
      hoveredControl: null,
      dragStart: null,
      preDrag: false,
    }
    this.tools = {
      PATH: 'path',
      // what else?
    }

    this.selector = {
      rect: new Size(0, 0),
      position: new Vector2(0, 0),
      hovers: [],
    }

    // TODO: make a playhead store obj
    this.view = {
      playheadHovered: false,
      playheadHoverLineFrame: null,
      playheadDragStart: null,
      playheadPixelsPerFrame: null,
      playheadCSSFrameOneStart: 100,
    }

    this.keyHeld = {
      Space: false,
      Shift: false,
      Meta: false,
      MiddleMouse: false,
    }

    this.propertyEditor = {
      position: new Vector2(16, 42 + 16 + 8),
      hiddenGroups: {},
      pairedVectors: {},
    }

    this.animation = new Animation()
    // TODO: removing this after debugging
    window._animation = this.animation

    makeObservable(this, {
      // rootContainer: Never changes, no need for observable, observable within
      project: observable,
      build: observable,
      selector: observable,
      view: observable,
      keyHeld: observable,
      propertyEditor: observable,
      // animation: Never changes, no need for observable, observable within

      setExporting: action,
      addNewPath: action,
      commitPath: action,

      setTool: action,
      setPointerPosition: action,
      setHovered: action,
      setHoveredControl: action,
      setSelected: action,
      addToSelection: action,
      removeFromSelection: action,

      indicatePreDrag: action,
      startDrag: action,
      stopDrag: action,

      setSelectorPosition: action,
      setSelectorRect: action,
      setSelectorHovers: action,

      setPlayheadHovered: action,
      setPlayheadHoverLineFrame: action,
      startPlayheadDrag: action,
      stopPlayheadDrag: action,
      setPlayheadPixelsPerFrame: action,
      resetView: action,

      setKeyHeld: action,

      setPropertyEditorPosition: action,
      hidePropertyGroup: action,
      showPropertyGroup: action,
      setPairedVector: action,

      /* Computeds */
      determineCurrentAction: computed,
    })
  }

  get determineCurrentAction() {
    if (this.keyHeld.Space || this.keyHeld.MiddleMouse) {
      if (this.build.preDrag || this.build.dragStart) {
        return 'dragging'
      }
      return 'readyToMoveView'
    }

    if (this.build.tool === this.tools.PATH) {
      return 'addingPathPoints'
    }

    if (this.build.hoveredId) {
      if (this.build.selectedIds.length > 0) {
        if (this.build.preDrag || this.build.dragStart) {
          return 'dragging'
        }
        if (this.keyHeld.Meta || this.keyHeld.Shift) {
          return 'adding'
        }
      }

      if (this.build.hoveredControl && this.build.hoveredControl.startsWith('handle')) {
        return this.build.hoveredControl.split('--')[1]
      }

      return 'hovering'
    }

    if (this.keyHeld.Meta || this.keyHeld.Shift) {
      if (this.build.selectedIds.length > 0) {
        return 'adding'
      }
    }

    return null
  }

  /* Container/Stage Actions */
  addNewItem(newItem) {
    const { selectedIds } = this.build
    const found = this.rootContainer.findItemAndParent(selectedIds[0])
    const selectedItem = found?.item
    if (selectedItem instanceof Container) {
      selectedItem.add(newItem)
    } else if (selectedItem) {
      found.parent.add(newItem)
    } else {
      this.rootContainer.add(newItem)
    }
    // TODO: removing this after debugging
    window._item = newItem
    return newItem
  }

  addContainer() {
    const newContainer = new Container()
    newContainer.setOrigin(new Vector2(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
    return this.addNewItem(newContainer)
  }

  addRectangle() {
    return this.addNewItem(new Rectangle(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addEllipse() {
    return this.addNewItem(new Ellipse(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addText() {
    return this.addNewItem(new Text(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addPolygon() {
    return this.addNewItem(new Polygon(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addLine() {
    return this.addNewItem(new Line(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addNewPath() {
    const newPath = new Path()
    this.addNewItem(newPath)
    this.build.activePath = newPath
    return newPath
  }

  commitPath() {
    let pathId
    if (this.build.activePath) {
      pathId = this.build.activePath.id
      this.build.activePath.commitPath()
    }
    this.build.tool = ''
    this.build.activePath = null
    this.build.pointerPosition = null
    if (pathId) {
      this.setSelected([pathId])
    }
  }

  /* Project Actions */
  setExporting(value) { this.project.isExporting = value }

  /* Build Actions */
  setTool(value) { this.build.tool = value }
  setPointerPosition(value) { this.build.pointerPosition = value }
  setHovered(value) { this.build.hoveredId = value }
  setHoveredControl(value) { this.build.hoveredControl = value }

  indicatePreDrag(indication) { this.build.preDrag = indication }
  startDrag(vector) { this.build.dragStart = vector }
  stopDrag() {
    this.build.preDrag = false
    this.build.dragStart = null
  }

  setSelected(values) {
    this.build.selectedIds = values
  }

  addToSelection(value) { this.build.selectedIds = [...this.build.selectedIds, value] }
  removeFromSelection(value) {
    this.build.selectedIds = this.build.selectedIds.filter((id) => id !== value)
  }

  selectAll() {
    this.setSelected(this.rootContainer.allItems)
  }

  /* Selector Actions */
  setSelectorPosition(vector) {
    this.selector.position.x = vector.x
    this.selector.position.y = vector.y
  }

  setSelectorRect(width, height) {
    this.selector.rect.width = width
    this.selector.rect.height = height
  }

  setSelectorHovers(values) { this.selector.hovers = values }

  /* View Actions */
  setPlayheadHovered(value) { this.view.playheadHovered = value }
  setPlayheadHoverLineFrame(value) { this.view.playheadHoverLineFrame = value }
  startPlayheadDrag(vector) { this.view.playheadDragStart = vector }
  stopPlayheadDrag() { this.view.playheadDragStart = null }
  setPlayheadPixelsPerFrame(value) { this.view.playheadPixelsPerFrame = value }
  resetView() {
    this.rootContainer.setCanvasToBestFit()
  }

  /* Key Hold Actions */
  setKeyHeld(key, state) {
    this.keyHeld[key] = state
  }

  /* Property Editor Actions */
  setPropertyEditorPosition(value) {
    this.propertyEditor.position.x = value.x
    this.propertyEditor.position.y = value.y
  }

  hidePropertyGroup(groupName) {
    this.propertyEditor.hiddenGroups[groupName] = true
  }

  showPropertyGroup(groupName) {
    this.propertyEditor.hiddenGroups[groupName] = false
  }

  setPairedVector(propertyKey, shouldPair) {
    this.propertyEditor.pairedVectors[propertyKey] = shouldPair
  }

  /* Output Actions */
  export = async () => {
    // TODO: Have this open a modal with settings & confirmation
    // TODO: Add a no-click handler to the screen since interacting with the stage
    //       will not cause a re-draw, and will actually be misleading/error-prone
    // TODO: Have progress output displayed Prepare-boolean, Frames-progress, video progress
    // TODO: wrap this whole thing in a giant error handler

    this.animation.pause()
    this.animation.goToFirst()
    this.setSelected([])

    this.setExporting(true)
    await sleep(1) // give React a tick to render the export-canvas

    const { canvasSize } = this.rootContainer
    const prepared = prepareForExport('export-canvas', canvasSize.width, canvasSize.height, this.animation.fps)
    if (prepared) {
      await this.animation.animateForExport(exportOneFrame)
      const videoAsBlob = await exportVideo()
      downloadBlob(videoAsBlob, 'webm')
    } else {
      // TODO: tell the user that we can't export using their browser
      console.warn('This browser is not preparred/capable of exporting video in the way the developer wants')
    }

    this.setExporting(false)
    this.animation.goToFirst()
  }

  /* Temp Functions */
  populate = () => {
    const r1 = this.addRectangle()
    const r2 = this.addRectangle()
    const r3 = this.addRectangle()
    const e4 = this.addEllipse()
    this.addText()

    r1.addKey('position', 1, new Vector2(100, 100))
    r1.addKey('position', 100, new Vector2(1820, 980))

    r2.addKey('position', 1, new Vector2(1820, 100))
    r2.addKey('position', 100, new Vector2(100, 980))

    r3.position.y = 300
    r3.addKey('rotation', 1, new Angle(0))
    r3.addKey('rotation', 100, new Angle(720))

    e4.position.y = 800
    e4.addKey('width', 1, 100)
    e4.addKey('width', 100, 1000)
  }
}

export default RootStore
