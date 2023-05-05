import { makeObservable, action, observable } from 'mobx'

import Container from './Container'
import Item from './Item'
import Size from './Size'
import Fill from '../visuals/Fill'
import Vector2 from './Vector2'

const identityMatrix = () => new DOMMatrix([1, 0, 0, 1, 0, 0])
const scaleSteps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5]

class RootContainer extends Container {
  constructor(store) {
    super()
    this.store = store
    Item.rootContainer = this
    this.transform = identityMatrix()

    // TODO: make these customizable
    this.canvasSize = new Size(1920, 1080)
    this.canvasPosition = new Vector2(0, 0)
    this._canvasScale = 1
    this.canvasFill = new Fill('black')
    this.dotFill = new Fill('rgb(42, 45, 48)')

    makeObservable(this, {
      canvasSize: observable,
      canvasPosition: observable,
      _canvasScale: observable,
      canvasFill: observable,
      checkPointerIntersections: action,
      changeScaleByStep: action,
    })
  }

  get canvasScale() { return this._canvasScale }
  set canvasScale(value) {
    if (value == null) return
    const scaleLowerBound = scaleSteps[0]
    const scaleUpperBound = scaleSteps[scaleSteps.length - 1]
    if (value < scaleLowerBound || value > scaleUpperBound) return
    this._canvasScale = value
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

  draw(ctx, rootWidth, rootHeight) {
    if (!rootWidth || !rootHeight) return

    this.ctx = ctx

    this.ctx.setTransform(identityMatrix())
    this.ctx.clearRect(0, 0, rootWidth, rootHeight)

    this.transform = identityMatrix()
      .translateSelf(
        (rootWidth / 2) - ((this.canvasSize.width / 2) * this.canvasScale),
        (rootHeight / 2) - ((this.canvasSize.height / 2) * this.canvasScale),
      )
      .scaleSelf(this.canvasScale, this.canvasScale)

    this.drawStageDots(rootWidth, rootHeight)
    this.drawCanvas()

    this.ctx.setTransform(this.transform)
    super.draw(
      this.transform,
      this.store.build.hoveredId,
      this.store.build.selectedId,
    )
  }

  drawStageDots(rootWidth, rootHeight) {
    if (this.canvasScale < 0.4) return

    this.ctx.setTransform(this.transform)
    this.ctx.translate(this.canvasSize.width / 2, this.canvasSize.height / 2)

    const dotWidth = 4
    const dotSpacing = 48
    const segmentLength = (dotSpacing + dotWidth)
    const directions = [1, -1]

    const xSpaceToWorkWith = ((rootWidth / 2) - (dotSpacing / 2)) / this.canvasScale
    const numDotsX = Math.ceil(xSpaceToWorkWith / segmentLength)
    const numDotsXHeight = Math.ceil(
      Math.ceil(((rootHeight / segmentLength) / this.canvasScale) / 2) * 2
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
    this.dotFill.draw(this.ctx)
  }

  drawCanvas() {
    this.ctx.setTransform(this.transform)
    this.ctx.beginPath()
    this.ctx.rect(0, 0, ...this.canvasSize.values)
    this.canvasFill.draw(this.ctx)
  }

  checkPointerIntersections(pointerVector) {
    const hovered = super.checkPointerIntersections(pointerVector, this.transform)
    this.store.setHovered(hovered)
  }
}

export default RootContainer
