import { makeAutoObservable } from 'mobx'

import { isEqual } from '../utility/array'
import Path from '../lib/shapes/Path'

class Build {
  constructor(store) {
    this.store = store

    this.tool = ''
    this.pointerPosition = null
    this.activePath = null
    this.activeControl = null
    this.activePoint = null
    this.selectedIds = []
    this.hoveredId = null
    this.hoveredControl = null
    this.hoveredPoint = null
    this.dragStart = null
    this.preDrag = false

    makeAutoObservable(this)
  }

  setTool(value) { this.tool = value }
  setPointerPosition(value) { this.pointerPosition = value }
  setHovered(value) { this.hoveredId = value }
  setHoveredControl(value) { this.hoveredControl = value }
  setActiveControl(value) { this.activeControl = value }
  setHoveredPoint(value) { this.hoveredPoint = value }
  setActivePoint(value) { this.activePoint = value }

  indicatePreDrag(indication) { this.preDrag = indication }
  startDrag(vector) { this.dragStart = vector }
  stopDrag() {
    this.preDrag = false
    this.dragStart = null
  }

  get isSelectionOneCompletePath() {
    if (this.selectedIds.length !== 1) return false
    if (this.activePath) return false
    const theOneItem = this.store.rootContainer.findItem(this.selectedIds[0])
    return theOneItem instanceof Path
  }

  get pseudoTool() {
    // We need a pseudoTool since some modes exist only as computations from other state
    // For example, editing the points of a path when only one complete path is selected.
    // The user doesn't indicate that they want to edit path points, instead we allow them
    // to perform this action when the computation "isSelectionOneCompletePath" is true
    let _pseudoTool
    if (this.isSelectionOneCompletePath) {
      _pseudoTool = this.store.tools.POINT
    }
    return _pseudoTool
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
