import { makeAutoObservable } from 'mobx'

import { isEqual } from '../utility/array'

class Build {
  constructor(store) {
    this.store = store

    this.tool = ''
    this.pointerPosition = null
    this.activePath = null
    this.activeControl = null
    this.selectedIds = []
    this.hoveredId = null
    this.hoveredControl = null
    this.dragStart = null
    this.preDrag = false

    makeAutoObservable(this)
  }

  setTool(value) { this.tool = value }
  setPointerPosition(value) { this.pointerPosition = value }
  setHovered(value) { this.hoveredId = value }
  setHoveredControl(value) { this.hoveredControl = value }
  setActiveControl(value) { this.activeControl = value }

  indicatePreDrag(indication) { this.preDrag = indication }
  startDrag(vector) { this.dragStart = vector }
  stopDrag() {
    this.preDrag = false
    this.dragStart = null
  }

  setSelected(values) {
    if (!isEqual(this.selectedIds, values)) {
      this.store.keyframeEditor.setSelected([])
    }
    this.selectedIds = values
  }

  addToSelection(value) {
    this.selectedIds = [...this.selectedIds, value]
    this.store.keyframeEditor.setSelected([])
  }

  removeFromSelection(value) {
    this.selectedIds = this.selectedIds.filter((id) => id !== value)
    this.store.keyframeEditor.setSelected([])
  }

  selectAll() {
    this.setSelected(this.store.rootContainer.allItems)
  }
}

export default Build
