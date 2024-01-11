import { makeAutoObservable } from 'mobx'

import { isEqual } from '../utility/array'
import Path from '../lib/shapes/Path'
import Container from '../lib/structure/Container'

// TODO [2]: Copy-Paste of a container does not duplicate all it's children

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

  allChildrenOfSelectedContainers(startingContainer) {
    const allChildIds = []
    Object.values(startingContainer.children).forEach((child) => {
      if (child instanceof Container) {
        if (this.selectedIds.includes(child.id)) {
          allChildIds.push(...child.allItems.slice(1))
        } else {
          allChildIds.push(...this.allChildrenOfSelectedContainers(child))
        }
      }
    })
    return allChildIds
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

  removeManyFromSelection(values) {
    this.selectedIds = this.selectedIds.filter((id) => !values.includes(id))
  }

  selectAll() {
    // Technically "Select All" only applies to root-level items, since any
    // item that is a child of a root-level container (at any depth), will be
    // "~selected~" through the selection of it's parent, which is on the root
    this.setSelected(
      Object.keys(this.store.rootContainer.children)
    )
  }

  copySelectionToClipboard() {
    // TODO [4]: Address the notes below, add resiliency, store enough info to paste into another project
    //           or if the user deletes the Item between copy & paste (can no logner access by Id)
    const selectedIdsAsJSON = JSON.stringify(this.selectedIds)
    navigator.clipboard.writeText(selectedIdsAsJSON)
      .then(() => {
        // Success!
        // Maybe add a snackbar component to show confirmation?
      })
      .catch(() => {
        // Failed D:
        // Maybe indicate this failure to the user
        // Or maybe just have a Global store clipboard as well
        // There's no reason we need to use the OS-level Clipboard unless we are implementing
        // copy and paste between different instances of the App
      })
  }

  pasteClipboard(clipboardText) {
    const itemIdsToDuplicate = JSON.parse(clipboardText)
    if (!Array.isArray(itemIdsToDuplicate)) return

    const resultingIds = []
    itemIdsToDuplicate.forEach((itemId) => {
      const item = this.store.rootContainer.findItem(itemId)
      if (!item) return
      const newId = item.duplicate()
      resultingIds.push(newId)
    })
    this.setSelected(resultingIds)
  }
}

export default Build
