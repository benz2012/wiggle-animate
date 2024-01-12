import { makeAutoObservable } from 'mobx'

import { isEqual } from '../utility/array'
import { incrementName } from '../utility/string'
import Path from '../lib/shapes/Path'
import Container from '../lib/structure/Container'
import shapeTypeMap from '../lib/shapes/shapeTypeMap'

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

  highestSelectedItemId(startingContainer) {
    const someChildSelected = Object.values(startingContainer.sortOrder).find((childId) => (
      this.selectedIds.includes(childId)
    ))
    if (someChildSelected) return someChildSelected
    let someGrandchildSelected
    Object.values(startingContainer.sortOrder).some((childId) => {
      const child = startingContainer.children[childId]
      if (child instanceof Container) {
        someGrandchildSelected = this.highestSelectedItemId(child)
        return true
      }
      return false
    })
    if (someGrandchildSelected) return someGrandchildSelected
    return undefined
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
    const selectedItemsPure = this.selectedIds.map((selectedId) => {
      const selectedItem = this.store.rootContainer.findItem(selectedId)
      return selectedItem.toPureObject()
    })
    const selectedItemsAsJSON = JSON.stringify(selectedItemsPure)
    navigator.clipboard.writeText(selectedItemsAsJSON)
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
    const itemsAsPureObjects = JSON.parse(clipboardText)
    if (!Array.isArray(itemsAsPureObjects)) return

    // Keep in mind, these Ids/Items will only reference the top-level of what was copy-pasted.
    // If their are children also being duplicated in this process, they will simply be managed through their parent
    const resultingIds = []
    const resultingItems = []

    itemsAsPureObjects.forEach((itemObj) => {
      const ItemType = itemObj.className === 'Container' ? Container : shapeTypeMap[itemObj.className]
      const newItem = new ItemType()
      newItem.fromPureObject(itemObj, false)
      resultingItems.push(newItem)
      resultingIds.push(newItem.id)
    })

    // Determine Paste-Level and Paste-Index
    // - the highest selected parent, or rootContainer if none selected
    // - the sortIndex above the selected item, or sortIndex 0 if the parent is a container
    let pasteParent = this.store.rootContainer
    let pasteIndex = 0
    const highestSelectedItemId = this.highestSelectedItemId(this.store.rootContainer)
    if (highestSelectedItemId) {
      pasteParent = this.store.rootContainer.findParent(highestSelectedItemId)
      pasteIndex = pasteParent.sortOrder.findIndex((childId) => childId === highestSelectedItemId)
    }

    // Check for duplicate names on the pasted-level, and increment the names of our new items
    const existingPasteLevelNames = Object.values(pasteParent.children).map((child) => child.name)
    resultingItems.forEach((newItem) => {
      while (existingPasteLevelNames.includes(newItem.name)) {
        newItem._name.setValue(incrementName(newItem.name))
      }
    })

    // Attatch pasted items to their new parent
    resultingItems.forEach((newItem) => {
      pasteParent.add(newItem, pasteIndex, false)
    })

    this.setSelected(resultingIds)
  }
}

export default Build
