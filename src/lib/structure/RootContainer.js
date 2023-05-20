import { makeObservable, action, observable } from 'mobx'

import Container from './Container'
import Item from './Item'
import Size from './Size'
import Fill from '../visuals/Fill'
import Vector2 from './Vector2'
import Stroke from '../visuals/Stroke'
import { identityMatrix } from '../../utility/matrix'

const scaleSteps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5]

class RootContainer extends Container {
  constructor(store) {
    super()
    this.store = store
    Item.rootContainer = this

    // non-observable, just for local reference
    this.rootWidth = window.innerWidth * this.DPR
    this.rootHeight = window.innerHeight * this.DPR

    this.canvasPosition = new Vector2(0, 0)
    this._canvasScale = 1
    // TODO: make these customizable
    this.canvasSize = new Size(1920, 1080)
    this.canvasFill = new Fill('black')
    this.setCanvasToBestFit()

    makeObservable(this, {
      canvasSize: observable,
      canvasPosition: observable,
      _canvasScale: observable,
      canvasFill: observable,
      checkPointerIntersections: action,
      findRectIntersections: action,
      changeScaleByStep: action,
    })
  }

  get canvasScale() { return this._canvasScale }
  set canvasScale(value) {
    if (value == null) return
    const scaleLowerBound = scaleSteps[0]
    const scaleUpperBound = scaleSteps[scaleSteps.length - 1]

    // Trim to 2 Sig Figs, compress at bounds
    let finalValue = Math.round((value + Number.EPSILON) * 100) / 100
    if (value < scaleLowerBound) {
      finalValue = scaleLowerBound
    } else if (value > scaleUpperBound) {
      finalValue = scaleUpperBound
    }

    const ratioBetweenScales = (finalValue / this._canvasScale)
    this._canvasScale = finalValue

    // this keeps the canvas "centered" when scaling
    // TODO: the center actually needs to align with the offset from BestFit
    //       this is complicated because it begs the question, will the user be working
    //       in the center of the screen or in the center of the "screen minus left menu"
    // TODO: if scaling with mousewheel, we should reposition towards the mouse, not the "center"
    this.canvasPosition.x *= (ratioBetweenScales ** 2)
    this.canvasPosition.y *= (ratioBetweenScales ** 2)
  }

  setCanvasToBestFit() {
    if (!this.rootWidth || !this.rootHeight) return

    const leftMenuSizeInCanvasPixels = 216 * this.DPR
    // the extra 16 pixels is just for some padding/wiggle room
    const spaceToWorkWith = this.rootWidth - leftMenuSizeInCanvasPixels - 16
    const existingRatio = spaceToWorkWith / this.canvasSize.width
    let bestScale
    scaleSteps.some((scaleStep) => {
      if (scaleStep > existingRatio) return true
      bestScale = scaleStep
      if (scaleStep === 1) return true
      return false
    })

    this._canvasScale = bestScale
    this.canvasPosition.x = (leftMenuSizeInCanvasPixels / 2) * bestScale
    this.canvasPosition.y = 0
  }

  changeScaleByStep(direction = 1) {
    let stepsWithCurrentScale
    if (scaleSteps.includes(this._canvasScale)) {
      stepsWithCurrentScale = [...scaleSteps]
    } else {
      stepsWithCurrentScale = [...scaleSteps, this._canvasScale]
    }
    stepsWithCurrentScale.sort()
    const currentIndex = stepsWithCurrentScale.findIndex((scale) => scale === this._canvasScale)
    this.canvasScale = stepsWithCurrentScale[currentIndex + direction]
  }

  incrementScale() { this.changeScaleByStep() }
  decrementScale() { this.changeScaleByStep(-1) }

  get canvasTopLeft() {
    return [
      (this.rootWidth / 2)
        - ((this.canvasSize.width / 2) * this.canvasScale)
        + (this.canvasPosition.x / this.canvasScale),
      (this.rootHeight / 2)
      - ((this.canvasSize.height / 2) * this.canvasScale)
      + (this.canvasPosition.y / this.canvasScale),
    ]
  }

  get allItems() {
    // remove root container id from list
    return super.allItems.slice(1)
  }

  findItem(itemId) {
    const result = this.findItemAndParent(itemId)
    if (result) return result.item
    return null
  }

  findParent(itemId) {
    const result = this.findItemAndParent(itemId)
    if (result) return result.parent
    return null
  }

  draw(ctx, rootWidth, rootHeight) {
    if (!rootWidth || !rootHeight) return

    this.ctx = ctx
    this.rootWidth = rootWidth
    this.rootHeight = rootHeight

    this.ctx.setTransform(identityMatrix())
    this.ctx.clearRect(0, 0, rootWidth, rootHeight)

    this.parentTransform = identityMatrix()
      .translateSelf(...this.canvasTopLeft)
      .scaleSelf(this.canvasScale, this.canvasScale)

    this.drawStageDots(rootWidth, rootHeight)
    this.drawCanvas()

    super.draw(
      this.parentTransform,
      this.store.build.hoveredId,
      this.store.build.hoveredControl,
      this.store.build.selectedIds,
      this.store.selector.hovers,
    )

    this.drawSelector()
  }

  drawStageDots(rootWidth, rootHeight) {
    if (this.DPR > 1 && this.canvasScale < 0.4) return
    if (this.canvasScale < 0.25) return

    this.ctx.setTransform(this.currentTransform)
    this.ctx.translate(this.canvasSize.width / 2, this.canvasSize.height / 2)

    const dotFill = new Fill('rgb(42, 45, 48)')
    const dotWidth = 4
    const dotSpacing = 48
    const segmentLength = (dotSpacing + dotWidth)
    const directions = [1, -1]

    const xSpaceToWorkWith = (
      (rootWidth / 2) - (dotSpacing / 2) + (Math.abs(this.canvasPosition.x) / this.canvasScale)
    ) / this.canvasScale
    const numDotsX = Math.ceil(xSpaceToWorkWith / segmentLength)
    const numDotsXHeight = Math.ceil(
      Math.ceil(((
        (rootHeight + (Math.abs(this.canvasPosition.y) * 2) / this.canvasScale) / segmentLength
      ) / this.canvasScale) / 2) * 2
    )

    this.ctx.beginPath()
    directions.forEach((direction) => {
      Array.from(Array(numDotsX)).forEach((_, xIndex) => {
        Array.from(Array(numDotsXHeight)).forEach((__, yIndex) => {
          const actualYIndex = ((numDotsXHeight / -2) + yIndex)
          this.ctx.rect(
            direction * xIndex * segmentLength + (direction * (segmentLength / 2)),
            actualYIndex * segmentLength,
            dotWidth,
            dotWidth,
          )
        })
      })
    })
    dotFill.draw(this.ctx)
  }

  drawCanvas() {
    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    this.ctx.rect(0, 0, ...this.canvasSize.values)
    this.canvasFill.draw(this.ctx)
  }

  drawSelector() {
    const { selector } = this.store
    if (selector.rect.area === 0) return

    this.ctx.setTransform(identityMatrix())

    this.ctx.beginPath()
    // this might be OS dependent, ~shrugs~
    const mouseGlyphOffset = this.DPR === 2 ? 2 : 0
    this.ctx.rect(
      selector.position.x - mouseGlyphOffset,
      selector.position.y,
      ...selector.rect.values,
    )
    const fill = new Fill('rgba(33, 150, 243, 0.1)')
    fill.draw(this.ctx)
    const lineWidth = 1 * this.DPR
    const stroke = new Stroke('rgb(33, 150, 243)', lineWidth)
    stroke.draw(this.ctx)
  }

  checkPointerIntersections(pointerVector) {
    const foundIntersection = super.checkPointerIntersections(pointerVector)
    if (!foundIntersection) {
      this.store.setHovered(null)
      this.store.setHoveredControl(null)
    }
  }

  moveAllSelectedByIncrement(relativeMovement, fromArrowKey = false) {
    this.store.build.selectedIds.forEach((selectedId) => {
      const relativeMovementScaledToCanvas = new Vector2(
        relativeMovement.x / this.canvasScale,
        relativeMovement.y / this.canvasScale,
      )
      const selectedItem = this.findItem(selectedId)
      if (this.store.build.hoveredControl === 'position' || fromArrowKey) {
        selectedItem.position.add(relativeMovementScaledToCanvas)
      } else if (this.store.build.hoveredControl === 'origin') {
        selectedItem.origin.add(relativeMovementScaledToCanvas)
      }
    })
  }
}

export default RootContainer
export { scaleSteps }
