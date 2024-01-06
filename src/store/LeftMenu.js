import { makeAutoObservable } from 'mobx'
import Container from '../lib/structure/Container'

class LeftMenu {
  constructor(store) {
    this.store = store

    this.hoveredId = null
    this.dragStart = null
    this.draggedId = null

    this.listPositionTop = null
    this.itemHeight = 22
    this.itemTextHeight = 14

    makeAutoObservable(this)
  }

  setHovered(value) { this.hoveredId = value }

  startDrag(pointerVector, withItemId) {
    this.dragStart = pointerVector
    this.draggedId = withItemId
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
    locationNumberBasedOnHeight = locationNumberBasedOnHeight === 0 ? 0 : locationNumberBasedOnHeight // eliminates -0
    const { allItemsShown } = this.store.rootContainer

    if (locationNumberBasedOnHeight < 0 || locationNumberBasedOnHeight > allItemsShown.length) return

    const { item, parent } = this.store.rootContainer.findItemAndParent(this.draggedId)
    let newParent = parent
    let newSortIndex = locationNumberBasedOnHeight

    // TODO [2]: when scrolling, these indexes will be wrong
    //           instead we will need to calculate locationNumber by whats rendered in the dom at the pointerY

    if (locationNumberBasedOnHeight === 0) {
      newParent = this.store.rootContainer
    } else {
      const itemIdAboveNewSort = this.store.rootContainer.allItemsShown[locationNumberBasedOnHeight - 1]
      const {
        item: itemAbove,
        parent: parentOfItemAbove,
      } = this.store.rootContainer.findItemAndParent(itemIdAboveNewSort)

      if (itemAbove.id === item.id) return

      // This prevents a container from moving inside of itself (paradox)
      if (item instanceof Container) {
        if (item.allItems.includes(itemIdAboveNewSort)) return
      }

      if (itemAbove instanceof Container && itemAbove.showChildren === true) {
        newParent = itemAbove
        newSortIndex = 0
      } else {
        newParent = parentOfItemAbove
        newSortIndex = parentOfItemAbove.sortOrder.findIndex((childId) => childId === itemIdAboveNewSort) + 1
      }
    }

    if (newParent.id !== parent.id) {
      parent.remove(this.draggedId)
      newParent.add(item, newSortIndex)
    } else {
      parent.sortChild(this.draggedId, newSortIndex)
    }
  }

  stopDrag() {
    if (this.dragStart == null) return
    this.determineNewSort()
    this.dragStart = null
    this.draggedId = null
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
