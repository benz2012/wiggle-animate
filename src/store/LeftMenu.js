import { makeAutoObservable } from 'mobx'

import Container from '../lib/structure/Container'
import { zeroIfZero } from '../utility/numbers'

class LeftMenu {
  constructor(store) {
    this.store = store

    this.hoveredId = null
    this.dragStart = null

    this.listPositionTop = null
    this.listScrollTop = 0
    this.itemHeight = 22
    this.itemTextHeight = 14

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

  determineNewSort() {
    const { allItemsShown } = this.store.rootContainer
    const { selectedIds, pointerPosition } = this.store.build

    if (pointerPosition == null) return
    if (this.dragIndicatorY === -1) return

    const pointerYRatioOne = pointerPosition.y / this.store.DPR
    const halfItemHeight = this.itemHeight / 2
    let scrollOffsetToItemBottom = this.itemHeight - (this.listScrollTop % this.itemHeight)
    scrollOffsetToItemBottom %= this.itemHeight
    const pointerYNearItemGap = pointerYRatioOne - halfItemHeight - scrollOffsetToItemBottom

    let locationNumberBasedOnHeight = Math.ceil((pointerYNearItemGap - this.listPositionTop) / this.itemHeight)
    locationNumberBasedOnHeight = zeroIfZero(locationNumberBasedOnHeight)
    const numItemsHiddenByScroll = Math.ceil(this.listScrollTop / this.itemHeight)
    locationNumberBasedOnHeight += numItemsHiddenByScroll

    let newParent
    let newSortIndex
    if (locationNumberBasedOnHeight === 0) {
      newParent = this.store.rootContainer
      newSortIndex = locationNumberBasedOnHeight
    } else {
      const itemIdAboveNewSort = allItemsShown[locationNumberBasedOnHeight - 1]
      const {
        item: itemAbove,
        parent: parentOfItemAbove,
      } = this.store.rootContainer.findItemAndParent(itemIdAboveNewSort)

      // Prevent moving to it's own current location
      if (selectedIds.includes(itemAbove.id)) return

      // Prevent a container from moving inside of itself
      const isParadox = selectedIds.some((itemId) => {
        const item = this.store.rootContainer.findItem(itemId)
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

    // Disconnect all selected items from the tree, and adjust for the gaps they are leaving
    const orderedSelectionToReSort = allItemsShown.filter((itemId) => selectedIds.includes(itemId))
    const itemsToReSort = []
    orderedSelectionToReSort.forEach((itemId) => {
      const { item, parent } = this.store.rootContainer.findItemAndParent(itemId)
      itemsToReSort.push(item)
      if (parent.id === newParent.id) {
        const itemsCurrentSortIndex = parent.sortOrder.findIndex((elm) => elm === itemId)
        if (itemsCurrentSortIndex < newSortIndex) {
          newSortIndex -= 1
        }
      }
      parent.remove(itemId)
    })
    newSortIndex = Math.max(newSortIndex, 0)

    // Finally, insert them all into their new location. Last item inserterd first since they will stack
    // on top of eachother as they insert
    itemsToReSort.reverse()
    itemsToReSort.forEach((item) => {
      newParent.add(item, newSortIndex, false)
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
