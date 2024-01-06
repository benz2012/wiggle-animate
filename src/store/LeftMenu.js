import { makeAutoObservable } from 'mobx'

import Container from '../lib/structure/Container'
import { zeroIfZero } from '../utility/numbers'

class LeftMenu {
  constructor(store) {
    this.store = store

    this.hoveredId = null
    this.dragStart = null

    this.listPositionTop = null
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

  setListPosition(top, bottom) {
    this.listPositionTop = top
    this.listPositionBottom = bottom
  }

  determineNewSort() {
    if (this.store.build.pointerPosition == null) return
    const pointerYRatioOne = this.store.build.pointerPosition.y / this.store.DPR
    const halfItemHeight = this.itemHeight / 2
    const pointerYNearItemGap = pointerYRatioOne - halfItemHeight
    let locationNumberBasedOnHeight = Math.ceil((pointerYNearItemGap - this.listPositionTop) / this.itemHeight)
    locationNumberBasedOnHeight = zeroIfZero(locationNumberBasedOnHeight)
    const { allItemsShown } = this.store.rootContainer

    if (locationNumberBasedOnHeight < 0 || locationNumberBasedOnHeight > allItemsShown.length) return

    const { selectedIds } = this.store.build

    // TODO [2]: when scrolling, these indexes will be wrong
    //           instead we will need to calculate locationNumber by whats rendered in the dom at the pointerY

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
    if (this.store.build.pointerPosition == null) return -1

    const pointerYRatioOne = this.store.build.pointerPosition.y / this.store.DPR
    if (pointerYRatioOne < this.listPositionTop) return -1
    if (pointerYRatioOne > this.listPositionBottom) return -1

    const halfItemHeight = this.itemHeight / 2
    const pointerYNearItemGap = pointerYRatioOne - halfItemHeight
    const locationNumberBasedOnHeight = Math.ceil((pointerYNearItemGap - this.listPositionTop) / this.itemHeight)
    if (locationNumberBasedOnHeight > this.store.rootContainer.allItemsShown.length) return -1

    const pointerYIntervalLocked = Math.ceil(pointerYNearItemGap / this.itemHeight) * this.itemHeight
    return pointerYIntervalLocked - 1
  }
}

export default LeftMenu
