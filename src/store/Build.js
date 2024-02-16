import { makeAutoObservable, toJS } from 'mobx'

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
    this.dragTargetMode = null
    this.dragDataBefore = null

    makeAutoObservable(this, { dragDataBefore: false })
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

  setDragTargetMode(mode) {
    this.dragTargetMode = mode
    this.dragDataBefore = this.selectedIds.map((selectedId) => {
      const item = this.store.rootContainer.findItem(selectedId)
      const [_, valueBefore] = this.getDragTargetData(item)
      return [selectedId, valueBefore]
    })
  }

  getDragTargetData(item) {
    let propertyName
    let valueData
    if (this.dragTargetMode === 'move') {
      if (this.hoveredControl === 'origin') {
        propertyName = '_origin'
        valueData = [item.origin.toPureObject(), item.position.toPureObject()]
      } else {
        propertyName = '_position'
        valueData = item.position.toPureObject()
      }
    } else if (this.dragTargetMode === 'rotate') {
      propertyName = '_rotation'
      valueData = item.rotation.toPureObject()
    } else if (this.dragTargetMode === 'resize') {
      propertyName = '_width&_height'
      valueData = [item.width, item.height]
    }
    return [propertyName, valueData]
  }

  stopDrag() {
    // If this was the previously active handler, submit a single action summarizing what just occured
    if (this.dragTargetMode) {
      let propertyName
      const dragDataAfter = this.selectedIds.map((selectedId) => {
        const item = this.store.rootContainer.findItem(selectedId)
        const targetData = this.getDragTargetData(item)
        if (!propertyName) {
          // we just need to set this once since all items will be effected on a single property
          propertyName = targetData[0]
        }
        const valueAfter = targetData[1]
        return [selectedId, valueAfter]
      })
      this.store.actionStack.push({
        perform: ['rootContainer.setValueForItems', [propertyName, this.store.animation.now, dragDataAfter]],
        revert: ['rootContainer.setValueForItems', [propertyName, this.store.animation.now, this.dragDataBefore]],
      })
    }

    this.preDrag = false
    this.dragStart = null
    this.dragTargetMode = null
    this.dragDataBefore = null
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
        if (someGrandchildSelected) return true
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

    this.store.rootContainer.openParentsOfTheseItems(values)
  }

  addToSelection(value) {
    this.selectedIds = [...this.selectedIds, value]
    this.store.rootContainer.openParentsOfTheseItems([value])
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

  deleteAllSelected(explicitListOfIds) {
    const idsToTarget = explicitListOfIds ?? this.selectedIds
    const itemsToDelete = idsToTarget.map((selectedId) => (
      this.store.rootContainer.findItem(selectedId)
    ))
    this.setSelected([])
    this.setHovered(null)
    itemsToDelete.forEach((item) => { item.delete() })
  }

  deleteAllSelectedWithAction() {
    const selectedItemsPure = this.selectedItemsAsPureObjects
    const treeSnapshot = this.store.rootContainer.allItemsShownAsTree
    const selectionSnapshot = toJS(this.selectedIds)

    this.deleteAllSelected()

    this.store.actionStack.push({
      revert: ['build.rebuildItemsAndTree', [selectedItemsPure, treeSnapshot]],
      perform: ['build.deleteAllSelected', [selectionSnapshot]],
    })
  }

  get selectedItemsAsPureObjects() {
    return this.selectedIds.map((selectedId) => {
      const selectedItem = this.store.rootContainer.findItem(selectedId)
      return selectedItem.toPureObject()
    })
  }

  copySelectionToClipboard(andThenDeleteIt = false) {
    const selectedItemsPure = this.selectedItemsAsPureObjects
    const selectedItemsAsJSON = JSON.stringify(selectedItemsPure)
    navigator.clipboard.writeText(selectedItemsAsJSON)
      .then(() => {
        // Success!
        // Maybe add a snackbar component to show confirmation?
      })
      .catch(() => {
        // Failed D:
        // Maybe indicate this failure to the user
        // Or maybe copy it to a Global-store clipboard instead
      })

    if (andThenDeleteIt) this.deleteAllSelectedWithAction()
  }

  static buildItemsFromPureObjects(itemsAsPureObjects, preserveIds) {
    const resultingIds = []
    const resultingItems = []
    itemsAsPureObjects.forEach((itemObj) => {
      const ItemType = itemObj.className === 'Container' ? Container : shapeTypeMap[itemObj.className]
      const newItem = new ItemType()
      newItem.fromPureObject(itemObj, preserveIds)
      resultingItems.push(newItem)
      resultingIds.push(newItem.id)
    })
    return [resultingIds, resultingItems]
  }

  pasteClipboard(clipboardText) {
    let itemsAsPureObjects = null
    try {
      itemsAsPureObjects = JSON.parse(clipboardText)
    } catch (err) {
      // Skip the paste function since JSON was invalid
      return
    }

    if (!Array.isArray(itemsAsPureObjects)) return

    // Keep in mind, these Ids/Items will only reference the top-level of what was copy-pasted.
    // If their are children also being duplicated in this process, they will simply be managed through their parent
    // Also, when pasting, we never want to preserve Id as there will either be a collision, or we are in another
    // project file in which case the original ids have no value anyways
    const [resultingIds, resultingItems] = Build.buildItemsFromPureObjects(itemsAsPureObjects, false)

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

    const finalPastedItemsPure = resultingItems.map((item) => item.toPureObject())
    const treeSnapshot = this.store.rootContainer.allItemsShownAsTree
    this.store.actionStack.push({
      revert: ['build.deleteAllSelected', [resultingIds]],
      perform: ['build.rebuildItemsAndTree', [finalPastedItemsPure, treeSnapshot]],
    })
  }

  pasteWithAButton = async () => {
    try {
      const text = await navigator.clipboard.readText()
      this.pasteClipboard(text)
    } catch (error) {
      const hiddenTextArea = document.getElementById('hidden-textarea')
      hiddenTextArea.focus()
      const result = document.execCommand('paste')
      if (result === true) {
        this.pasteClipboard(hiddenTextArea.value)
        hiddenTextArea.value = ''
      } else {
        // TODO [3]: Open the Modal that says, you cannot paste via button in this browser
        // use the hotkey instead
      }
    }
  }

  rebuildItemsAndTree(selectedItemsPure, treeSnapshot) {
    const [resultingIds, resultingItems] = Build.buildItemsFromPureObjects(selectedItemsPure, true)
    // We blindly attatch the new items to the root, as we are about to re-sort them all in the next step
    resultingItems.forEach((newItem) => {
      this.store.rootContainer.add(newItem)
    })
    this.store.rootContainer.setTree(treeSnapshot, resultingIds)
  }
}

export default Build
