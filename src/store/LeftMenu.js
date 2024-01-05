import { makeAutoObservable } from 'mobx'

class LeftMenu {
  constructor(store) {
    this.store = store

    this.hoveredId = null
    this.dragStart = null
    this.draggedId = null

    this.itemHeight = 22
    this.itemTextHeight = 14

    makeAutoObservable(this)
  }

  setHovered(value) { this.hoveredId = value }

  startDrag(pointerVector, withItemId) {
    this.dragStart = pointerVector
    this.draggedId = withItemId
  }

  stopDrag() {
    // Determine where to sort the item now that user has let go of it
    this.dragStart = null
    this.draggedId = null
  }

  get dragIndicatorY() {
    if (this.store.build.pointerPosition == null) return 0
    const pointerYRatioOne = this.store.build.pointerPosition.y / this.store.DPR
    const halfItemHeight = this.itemHeight / 2
    const pointerYNearItemGap = pointerYRatioOne - halfItemHeight
    const pointerYIntervalLocked = Math.ceil(pointerYNearItemGap / this.itemHeight) * this.itemHeight
    return pointerYIntervalLocked - 1
  }
}

export default LeftMenu
