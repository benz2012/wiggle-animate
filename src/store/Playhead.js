import { makeAutoObservable } from 'mobx'

class Playhead {
  constructor(store) {
    this.store = store

    this.hovered = false
    this.hoverLineFrame = null
    this.dragStart = null
    this.pixelsPerFrame = null

    this.cssWidth = 12
    this.cssStrokeProtrusion = 2
    this.cssFrameOneStart = 100
    this.canvasWidthLessThanWindow = 184
    this.canvasHeight = 33
    this.boundRegionHeight = 8
    this.cssTrueHalf = (this.cssWidth + this.cssStrokeProtrusion) / 2

    makeAutoObservable(this)
  }

  setHovered(value) { this.hovered = value }
  setHoverLineFrame(value) { this.hoverLineFrame = value }
  startDrag(vector) { this.dragStart = vector }
  stopDrag() { this.dragStart = null }
  setPixelsPerFrame(value) { this.pixelsPerFrame = value }
}

export default Playhead
