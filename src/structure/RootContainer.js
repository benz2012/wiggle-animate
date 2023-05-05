import { makeObservable, action } from 'mobx'

import Container from './Container'
import Item from './Item'
import Size from './Size'
import Fill from '../visuals/Fill'

const identityMatrix = () => new DOMMatrix([1, 0, 0, 1, 0, 0])

class RootContainer extends Container {
  constructor(store) {
    super()
    this.store = store
    Item.rootContainer = this
    this.transform = identityMatrix()

    // TODO: make these customizable
    // this.canvasSize = new Size(1920, 1080)
    this.canvasSize = new Size(960, 540)
    this.canvasScale = 1
    this.canvasFill = new Fill('black')
    this.dotFill = new Fill('rgb(42, 45, 48)')

    makeObservable(this, { checkPointerIntersections: action })
  }

  draw(ctx, rootWidth, rootHeight) {
    if (!rootWidth || !rootHeight) return

    this.ctx = ctx

    this.ctx.setTransform(identityMatrix())
    this.ctx.clearRect(0, 0, rootWidth, rootHeight)

    this.transform = identityMatrix()
      .translateSelf(
        (rootWidth / 2) - (this.canvasSize.width / 2),
        (rootHeight / 2) - (this.canvasSize.height / 2),
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
    this.ctx.setTransform(this.transform)
    this.ctx.translate(this.canvasSize.width / 2, this.canvasSize.height / 2)

    const dotWidth = 4
    const dotSpacing = 48
    const segmentLength = (dotSpacing + dotWidth)
    const directions = [1, -1]

    const xSpaceToWorkWith = (rootWidth / 2) - (dotSpacing / 2)
    const numDotsX = Math.ceil(xSpaceToWorkWith / segmentLength)
    const numDotsXHeight = Math.ceil((rootHeight / segmentLength) / 2) * 2

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
