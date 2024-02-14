import { makeAutoObservable, toJS } from 'mobx'

import Container from '../lib/structure/Container'
import { zeroIfZero } from '../utility/numbers'
import { isObject } from '../utility/object'
import { insert } from '../utility/array'

class LeftMenu {
  constructor(store) {
    this.store = store

    this.hoveredId = null
    this.dragStart = null

    this.listPositionTop = null
    this.listScrollTop = 0
    this.itemHeight = 22
    this.itemTextHeight = 14

    this.containerToOpen = null
    this.containerToOpenCount = 0

    makeAutoObservable(this)
  }

  setHovered(value) { this.hoveredId = value }

  startDrag(pointerVector) {
    this.dragStart = pointerVector
  }

  releaseDrag() {
    this.determineNewSort()
    this.stopDrag()
  }

  stopDrag() {
    this.dragStart = null
  }

  setListPosition(top, bottom, right) {
    this.listPositionTop = top
    this.listPositionBottom = bottom
    this.listPositionRight = right
  }

  handleListScroll = (event) => {
    this.listScrollTop = event.target.scrollTop
  }

  pointerLocationNumberWithinShownItems(betweenTheLines = true) {
    if (this.store.build.pointerPosition == null) return -1
    if (this.dragIndicatorY === -1) return -1

    // store.build.pointerPosition is multiplied by DPR for use on the Canvas
    const pointerY = this.store.build.pointerPosition.y / this.store.DPR
    const halfItemHeight = this.itemHeight / 2
    let scrollOffsetToItemBottom = this.itemHeight - (this.listScrollTop % this.itemHeight)
    scrollOffsetToItemBottom %= this.itemHeight
    let pointerYNearItemGap = pointerY - scrollOffsetToItemBottom
    if (betweenTheLines) {
      pointerYNearItemGap -= halfItemHeight
    } else {
      pointerYNearItemGap -= this.itemHeight
    }

    let locationNumberBasedOnHeight = Math.ceil((pointerYNearItemGap - this.listPositionTop) / this.itemHeight)
    locationNumberBasedOnHeight = zeroIfZero(locationNumberBasedOnHeight)
    const numItemsHiddenByScroll = Math.ceil(this.listScrollTop / this.itemHeight)
    locationNumberBasedOnHeight += numItemsHiddenByScroll

    return locationNumberBasedOnHeight
  }

  closedContainerHovered() {
    const { allItemsShown } = this.store.rootContainer

    const locationNumberBasedOnHeight = this.pointerLocationNumberWithinShownItems(false)
    if (locationNumberBasedOnHeight === -1) return null

    const itemIdHovered = allItemsShown[locationNumberBasedOnHeight]
    const itemHovered = this.store.rootContainer.findItem(itemIdHovered)
    if (itemHovered instanceof Container && !itemHovered.showChildren) {
      return itemIdHovered
    }
    return null
  }

  clearContainerToOpen() {
    this.containerToOpen = null
    this.containerToOpenCount = 0
  }

  incrementContainerToOpen(containerId) {
    this.containerToOpen = containerId
    const newCount = this.containerToOpenCount + 1

    if (newCount >= 10) {
      const container = this.store.rootContainer.findItem(containerId)
      container.showChildren = true
      this.clearContainerToOpen()
      return true
    }

    this.containerToOpenCount = newCount
    return false
  }

  determineNewSort() {
    const { rootContainer, build, actionStack } = this.store
    const { allItemsShown } = rootContainer
    const { selectedIds } = build

    const locationNumberBasedOnHeight = this.pointerLocationNumberWithinShownItems()
    if (locationNumberBasedOnHeight === -1) return

    let newParent
    let newSortIndex
    if (locationNumberBasedOnHeight === 0) {
      newParent = rootContainer
      newSortIndex = locationNumberBasedOnHeight
    } else {
      const itemIdAboveNewSort = allItemsShown[locationNumberBasedOnHeight - 1]
      const {
        item: itemAbove,
        parent: parentOfItemAbove,
      } = rootContainer.findItemAndParent(itemIdAboveNewSort)

      // Prevent moving to it's own current location
      if (selectedIds.includes(itemAbove.id)) return

      // Prevent a container from moving inside of itself
      const isParadox = selectedIds.some((itemId) => {
        const item = rootContainer.findItem(itemId)
        return (
          item instanceof Container
          && item.allItems.includes(itemIdAboveNewSort)
        )
      })
      if (isParadox) return

      if (itemAbove instanceof Container && itemAbove.showChildren === true) {
        newParent = itemAbove
        newSortIndex = 0
      } else {
        newParent = parentOfItemAbove
        newSortIndex = parentOfItemAbove.sortOrder.findIndex((childId) => childId === itemIdAboveNewSort) + 1
      }
    }

    // Prepare For: Disconnecting all selected items from the tree, and adjusting for the gaps they are leaving,
    // and re-inserting them to their new parent.
    const orderedSelectionToReSort = allItemsShown.filter((itemId) => selectedIds.includes(itemId))

    let containersToMove = {}
    const reSortTree = (subTree) => {
      const [containerId, children] = Object.entries(subTree)[0]
      let newChildren = children.map((itemId) => {
        if (isObject(itemId)) {
          const containerChildId = Object.keys(itemId)[0]
          if (selectedIds.includes(containerChildId)) {
            containersToMove = { ...containersToMove, ...reSortTree(itemId) }
            return 'remove-this'
          }
          return reSortTree(itemId)
        }
        if (selectedIds.includes(itemId)) {
          return 'remove-this'
        }
        return itemId
      })
      if (containerId === newParent.id) {
        newChildren = insert(newChildren, newSortIndex, ...orderedSelectionToReSort)
      }
      newChildren = newChildren.filter((elm) => elm !== 'remove-this')
      return { [containerId]: newChildren }
    }

    const reInsertContainers = (subTree) => {
      const [containerId, children] = Object.entries(subTree)[0]
      const newChildren = children.map((itemId) => {
        if (isObject(itemId)) {
          return reInsertContainers(itemId)
        }
        if (itemId in containersToMove) {
          return { [itemId]: containersToMove[itemId] }
        }
        return itemId
      })
      return { [containerId]: newChildren }
    }

    const originalTree = rootContainer.allItemsShownAsTree
    const newTreeSimple = reSortTree(originalTree)
    const newTree = reInsertContainers(newTreeSimple)

    // We operate on declarative snapshots of the tree to elimiate imperative sorting issues
    rootContainer.setTree(newTree, selectedIds)
    actionStack.push({
      perform: ['rootContainer.setTree', [newTree, toJS(selectedIds)]],
      revert: ['rootContainer.setTree', [originalTree, toJS(selectedIds)]],
    })
  }

  get dragIndicatorY() {
    const { pointerPosition } = this.store.build
    if (pointerPosition == null) return -1
    const halfItemHeight = this.itemHeight / 2
    const quarterItemHeight = (halfItemHeight / 2)

    let scrollOffsetToItemBottom = this.itemHeight - (this.listScrollTop % this.itemHeight)
    scrollOffsetToItemBottom %= this.itemHeight

    // store.build.pointerPosition is multiplied by DPR for use on the Canvas
    const pointerX = pointerPosition.x / this.store.DPR
    const pointerY = pointerPosition.y / this.store.DPR
    if (pointerX - this.dragStart.x > this.listPositionRight * 1.1) return -1
    if (pointerY + quarterItemHeight - scrollOffsetToItemBottom < this.listPositionTop) return -1
    if (pointerY + quarterItemHeight - scrollOffsetToItemBottom > this.listPositionBottom) return -1

    const pointerYNearItemGap = pointerY - halfItemHeight - scrollOffsetToItemBottom
    const locationNumberBasedOnHeight = Math.ceil((pointerYNearItemGap - this.listPositionTop) / this.itemHeight)
    if (locationNumberBasedOnHeight > this.store.rootContainer.allItemsShown.length) return -1

    const pointerYIntervalLocked = Math.ceil(pointerYNearItemGap / this.itemHeight) * this.itemHeight
    return pointerYIntervalLocked - 1 + scrollOffsetToItemBottom
  }
}

export default LeftMenu
