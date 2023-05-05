import { makeObservable, action, observable } from 'mobx'

import Container from './Container'
import Item from './Item'
import Size from './Size'
import Fill from '../visuals/Fill'
import Vector2 from './Vector2'
import Stroke from '../visuals/Stroke'

const identityMatrix = () => new DOMMatrix([1, 0, 0, 1, 0, 0])
const scaleSteps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5]

class RootContainer extends Container {
  constructor(store) {
    super()
    this.store = store
    Item.rootContainer = this
    this.transform = identityMatrix()

    // non-observable, just for local reference
    this.rootWidth = null
    this.rootHeight = null

    this.canvasPosition = new Vector2(0, 0)
    // TODO: figure out initial scale based on screen size and canvas size
    //       and how much available space is left by the toolbars
    this._canvasScale = 1
    // TODO: make these customizable
    this.canvasSize = new Size(1920, 1080)
    this.canvasFill = new Fill('black')

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
    if (value < scaleLowerBound || value > scaleUpperBound) return
    const ratioBetweenScales = (value / this._canvasScale)
    this._canvasScale = value
    this.canvasPosition.x *= (ratioBetweenScales ** 2)
    this.canvasPosition.y *= (ratioBetweenScales ** 2)
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
    if (!this.rootWidth || !this.rootHeight) return [0, 0]
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

  draw(ctx, rootWidth, rootHeight) {
    if (!rootWidth || !rootHeight) return

    this.ctx = ctx
    this.rootWidth = rootWidth
    this.rootHeight = rootHeight

    this.ctx.setTransform(identityMatrix())
    this.ctx.clearRect(0, 0, rootWidth, rootHeight)

    this.transform = identityMatrix()
      .translateSelf(...this.canvasTopLeft)
      .scaleSelf(this.canvasScale, this.canvasScale)

    this.drawStageDots(rootWidth, rootHeight)
    this.drawCanvas()

    this.ctx.setTransform(this.transform)
    super.draw(
      this.transform,
      this.store.build.hoveredId,
      this.store.build.selectedIds,
      this.store.selector.hovers,
    )

    this.drawSelector()
  }

  drawStageDots(rootWidth, rootHeight) {
    if (this.canvasScale < 0.4) return

    this.ctx.setTransform(this.transform)
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
    this.ctx.setTransform(this.transform)
    this.ctx.beginPath()
    this.ctx.rect(0, 0, ...this.canvasSize.values)
    this.canvasFill.draw(this.ctx)
  }

  drawSelector() {
    const { selector } = this.store
    if (selector.rect.area === 0) return

    this.ctx.setTransform(identityMatrix())
    this.ctx.beginPath()
    // this might be OS dependent, but the -2 on X seems to get it
    // more in line with the mouse glyph center point
    this.ctx.rect(
      selector.position.x - 2,
      selector.position.y,
      ...selector.rect.values,
    )
    const fill = new Fill('rgba(33, 150, 243, 0.1)')
    fill.draw(this.ctx)
    const stroke = new Stroke('rgb(33, 150, 243', 4)
    stroke.draw(this.ctx)
  }

  checkPointerIntersections(pointerVector) {
    const foundIntersection = super.checkPointerIntersections(pointerVector, this.transform)
    if (!foundIntersection) {
      this.store.setHovered(null)
    }
  }

  findRectIntersections(rectSpecTLBR) {
    const foundIntersections = super.findRectIntersections(rectSpecTLBR, this.transform)
    return foundIntersections
  }
}

export default RootContainer
