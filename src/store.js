import { observable, autorun, makeObservable, action, computed } from 'mobx'

import RootContainer from './structure/RootContainer'
import Container from './structure/Container'
import Vector2 from './structure/Vector2'
import Size from './structure/Size'
import Rectangle from './shapes/Rectangle'
import Ellipse from './shapes/Ellipse'
import { storageEnabled } from './utility/storage'

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
    }

    this.build = {
      tool: '',
      selectedIds: [],
      hoveredId: null,
      dragStart: null,
    }

    this.selector = {
      rect: new Size(0, 0),
      position: new Vector2(0, 0),
      hovers: [],
    }

    this.view = {}

    this.keyHeld = {
      Space: false,
      Shift: false,
      Meta: false,
      MiddleMouse: false,
    }

    this.propertyEditor = { position: new Vector2(16, 42 + 16 + 8) }

    makeObservable(this, {
      rootContainer: observable,
      project: observable,
      build: observable,
      selector: observable,
      view: observable,
      keyHeld: observable,
      propertyEditor: observable,

      setHovered: action,
      setSelected: action,
      addToSelection: action,
      removeFromSelection: action,

      startDrag: action,
      stopDrag: action,

      setSelectorPosition: action,
      setSelectorRect: action,
      setSelectorHovers: action,

      resetView: action,

      setKeyHeld: action,

      setPropertyEditorPosition: action,

      /* Computeds */
      determineCurrentAction: computed,
    })
  }

  get determineCurrentAction() {
    if (this.keyHeld.Space || this.keyHeld.MiddleMouse) {
      if (this.build.dragStart) {
        return 'dragging'
      }
      return 'readyToMoveView'
    }

    if (this.build.hoveredId) {
      if (this.build.selectedIds.length > 0) {
        if (this.build.dragStart) {
          return 'dragging'
        }
        if (this.keyHeld.Meta || this.keyHeld.Shift) {
          return 'adding'
        }
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
    return newItem
  }

  addContainer() {
    this.addNewItem(new Container())
  }

  addRectangle() {
    const item = this.addNewItem(new Rectangle(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
    window._item = item
  }

  addEllipse() {
    this.addNewItem(new Ellipse(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  /* Build Actions */
  setHovered(value) { this.build.hoveredId = value }
  startDrag(vector) { this.build.dragStart = vector }
  stopDrag() { this.build.dragStart = null }
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
}

export default RootStore
