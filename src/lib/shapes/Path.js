import { makeObservable, action } from 'mobx'

import Shape from '../drawing/Shape'
import Item from '../structure/Item'
import Vector2 from '../structure/Vector2'
import Color from '../visuals/Color'
import { observeListOfProperties } from '../../utility/state'
import { drawPathPoint } from '../../utility/drawing'

class Path extends Shape {
  static get NEARITY_THRESHOLD() { return 8 }

  constructor(...args) {
    super('path', ...args)

    // overwrite defaults
    this.fill.color.alpha = 0
    this.stroke.color = new Color(this.fill.color.spec)
    this.stroke.width = 3

    this.points = []
    this.close = false
    this.hoveringOverStart = false

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'points', 'close', 'hoveringOverStart']
    observeListOfProperties(this, this.observables, inheritedObservables)
    makeObservable(this, {
      processBounds: action,
      addPoint: action,
      pointerNearStart: action,
    })
  }

  addPoint(pointerVector) {
    // return true if path should be "committed"
    if (this.hoveringOverStart) {
      this.close = true
      this.hoveringOverStart = false
      return true
    }

    const parentTransform = Item.rootContainer.findParent(this.id).currentTransform
    const pointInCanvasSpace = DOMMatrix
      .fromMatrix(parentTransform)
      .invertSelf()
      .translateSelf(...pointerVector.values)

    this.points.push(new Vector2(pointInCanvasSpace.e, pointInCanvasSpace.f))
    return false
  }

  pointerNearStart(pointerVector) {
    const parentTransform = Item.rootContainer.findParent(this.id).currentTransform
    const pointInCanvasSpace = DOMMatrix
      .fromMatrix(parentTransform)
      .invertSelf()
      .translateSelf(...pointerVector.values)
    const vectorInCanvasSpace = new Vector2(pointInCanvasSpace.e, pointInCanvasSpace.f)
    const distance = vectorInCanvasSpace.distance(this.points[0])

    if (distance <= Path.NEARITY_THRESHOLD) {
      this.hoveringOverStart = true
      return true
    }

    this.hoveringOverStart = false
    return false
  }

  processBounds() {
    // TODO: this only needs to run when this.points changes, not during draw

    if (this.points.length === 0) {
      this.width = 0
      this.height = 0
      return
    }

    let maxX = Number.POSITIVE_INFINITY
    let minX = Number.NEGATIVE_INFINITY
    let maxY = Number.POSITIVE_INFINITY
    let minY = Number.NEGATIVE_INFINITY

    this.points.forEach((point) => {
      if (point.x > maxX) {
        maxX = point.x
      } else if (point.x < minX) {
        minX = point.x
      }

      if (point.y > maxY) {
        maxY = point.y
      } else if (point.y < minY) {
        minY = point.y
      }
    })

    this.width = maxX - minX
    this.height = maxY - minY
  }

  drawShape() {
    if (this.points.length === 0) return
    this.processBounds()
    // const [rectX, rectY, rectW, rectH] = this.rectSpec

    // Draw the Path Itself
    this.ctx.beginPath()
    this.ctx.moveTo(...this.points[0].values)
    this.points.slice(1).forEach((point) => {
      this.ctx.lineTo(...point.values)
    })
    if (this.close) {
      this.ctx.closePath()
    }
    this.shadow.prepare(this.ctx)
    this.stroke.draw(this.ctx)
    this.fill.draw(this.ctx)

    // Draw Point Handles on top of it
    this.ctx.setTransform(this.currentTransform)
    this.ctx.translate(...this.points[0].values)
    drawPathPoint(this.ctx, this.hoveringOverStart)
    this.points.slice(1).forEach((point, index) => {
      // "index" represents the previous index since we sliced by 1
      const translateBy = Vector2.subtract(point, this.points[index])
      this.ctx.translate(...translateBy.values)
      drawPathPoint(this.ctx)
    })
  }
}

export default Path
