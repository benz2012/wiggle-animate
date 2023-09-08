import { makeObservable, action } from 'mobx'
import polylabel from '../_external/polylabel'

import Shape from '../drawing/Shape'
import Item from '../structure/Item'
import Vector2 from '../structure/Vector2'
import Point from '../structure/Point'
import Color from '../visuals/Color'
import { observeListOfProperties } from '../../utility/state'
import { drawPathPoint, drawHoveredIndicatorPath } from '../../utility/drawing'
import { randomChoice } from '../../utility/array'

class Path extends Shape {
  static get NEARITY_THRESHOLD() { return 8 }

  constructor(...args) {
    super('path', ...args)

    // TODO: add Property instances throughout this class

    // overwrite defaults
    this.fill.color.alpha = 0
    this.stroke.color = new Color(this.fill.color.spec)
    this.stroke.width = 3
    this.controllerType = 'Path'

    this.points = []
    this.closed = false
    this.hoveringOverStart = false
    this.pointsVisible = true

    // TODO: Allow Path to be edited in Object mode or Point mode
    // Object mode -- similar to shapes now (move, scale, rotate the object as a whole)
    // Point mode -- move each point individually, or move/scale/rotate mutliple points at once
    //               any changes here only affect the position of each point, and nothing else

    // ignore alignment since drawing is done from points instead of relation to this.position
    this.alignment.isEditable = false

    observeListOfProperties(this, ['points', 'closed', 'hoveringOverStart'])
    makeObservable(this, {
      processBounds: action,
      addPoint: action,
      pointerNearStart: action,
    })
  }

  addPoint(pointerVector) {
    // return true if path should be "committed"
    if (this.hoveringOverStart) {
      this.closed = true
      this.hoveringOverStart = false
      return true
    }

    const parentTransform = Item.rootContainer.findParent(this.id).currentTransform
    const pointInCanvasSpace = DOMMatrix
      .fromMatrix(parentTransform)
      .invertSelf()
      .translateSelf(...pointerVector.values)

    // TODO: implement bezier control point adjustments
    // just using random cps for now for proof of drawing
    const thisPoint = new Point(pointInCanvasSpace.e, pointInCanvasSpace.f)
    thisPoint.controlOut.x = thisPoint.x + randomChoice([-1, 1]) * Math.floor(Math.random() * 100)
    thisPoint.controlOut.y = thisPoint.y + randomChoice([-1, 1]) * Math.floor(Math.random() * 100)
    thisPoint.controlIn.x = thisPoint.x + randomChoice([-1, 1]) * Math.floor(Math.random() * 100)
    thisPoint.controlIn.y = thisPoint.y + randomChoice([-1, 1]) * Math.floor(Math.random() * 100)
    this.points.push(thisPoint)
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

  calculateOrigin() {
    const polygonSpec = this.points.map((point) => (point.values))
    const poleOfInaccessibility = polylabel([polygonSpec])
    this.setOrigin(poleOfInaccessibility)
  }

  commitPath() {
    this.calculateOrigin()
    this.pointsVisible = false
  }

  drawThePath() {
    this.ctx.moveTo(...this.points[0].values)
    this.points.slice(1).forEach((point, index) => {
      const prevControl = this.points[index].controlOut
      const thisControl = point.controlIn
      this.ctx.bezierCurveTo(
        prevControl.x,
        prevControl.y,
        thisControl.x,
        thisControl.y,
        point.x,
        point.y,
      )
    })

    if (this.closed) {
      const lastPoint = this.points[this.points.length - 1]
      const firstPoint = this.points[0]
      this.ctx.bezierCurveTo(
        lastPoint.controlOut.x,
        lastPoint.controlOut.y,
        firstPoint.controlIn.x,
        firstPoint.controlIn.y,
        firstPoint.x,
        firstPoint.y,
      )
    }
  }

  processBounds() {
    // TODO: this only needs to run when this.points changes, not during draw

    if (this.points.length === 0) {
      this.width = 0
      this.height = 0
      return [0, 0]
    }

    let maxX = Number.NEGATIVE_INFINITY
    let minX = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY

    this.points.forEach((point) => {
      if (point.x > maxX) {
        maxX = point.x
      }
      if (point.x < minX) {
        minX = point.x
      }
      if (point.y > maxY) {
        maxY = point.y
      }
      if (point.y < minY) {
        minY = point.y
      }
    })

    this.width = maxX - minX
    this.height = maxY - minY
    return [minX, minY]
  }

  get rectSpec() {
    const topLeft = this.processBounds()
    return [topLeft[0], topLeft[1], this.width, this.height]
  }

  drawHoveredIndicator() {
    drawHoveredIndicatorPath(this)
  }

  checkPointerIntersections(pointerVector) {
    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    this.drawThePath()
    // make a fake stroke around the path to check for "near" intersections
    this.ctx.lineWidth = 10
    if (this.ctx.isPointInStroke(...pointerVector.values)) return true
    return false
  }

  /*
    TODO: add a custom findRectIntersections() implementation that works
    more similarly to checkPointerIntersections. Currently it checks against
    the rectSpec which doesn't account for concave path paths and/or holes
  */

  drawShape(isHovered, isSelected) {
    if (this.points.length === 0) return

    // Draw the Path Itself
    this.ctx.beginPath()
    this.drawThePath()
    this.shadow.prepare(this.ctx)
    this.stroke.draw(this.ctx)
    this.fill.draw(this.ctx)

    // Draw Point Handles on top of it
    if (!this.pointsVisible && !isSelected) return
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
