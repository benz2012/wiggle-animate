import { makeObservable, action } from 'mobx'
import polylabel from '../_external/polylabel'

import VisibleShape from '../drawing/VisibleShape'
import Vector2 from '../structure/Vector2'
import Point from '../structure/Point'
import Angle from '../structure/Angle'
import { observeListOfProperties } from '../../utility/state'
import {
  drawPathPoint,
  drawPathControlPoint,
  drawPathControlLine,
  drawHoveredIndicatorPath,
  drawControllerCenter,
  setPointRectOnCtx,
  setControlPointEllipseOnCtx,
} from '../../utility/drawing'

class Path extends VisibleShape {
  static get className() { return 'Path' }
  static get NEARITY_THRESHOLD() { return 8 }
  static get DIRECTIONS() { return { CLOCKWISE: 1, COUNTER_CLOCKWISE: -1 } }

  constructor(...args) {
    super('path', ...args)
    // overwrite defaults
    this._fillOpacity.setValue(0)
    this._strokeColor.setValue(this.fillColor)
    this._strokeOpacity.setValue(100)
    this._strokeWidth.setValue(3)
    this.controllerType = 'Path'

    this.points = [] // TODO [3]: (maybe) make each point a Property, iterate over them customly within PropEditor
    this.closed = false
    this.hoveringOverStart = false
    // This only exists so I can draw the path points before the path can be legally "selected"
    this.pointsVisible = true
    this.direction = Path.DIRECTIONS.CLOCKWISE

    // TODO [3]: Allow Path to be edited in Object mode or Point mode
    // Object mode -- similar to shapes now (move, scale, rotate the object as a whole)
    // Point mode -- move each point individually, or move/scale/rotate mutliple points at once
    //               any changes here only affect the position of each point, and nothing else

    // ignore these since drawing is done from points instead of relation to this.position
    this._alignment.isEditable = false
    this._width.isEditable = false
    this._width.isKeyframable = false
    this._height.isEditable = false
    this._height.isKeyframable = false

    observeListOfProperties(this, ['points', 'closed', 'hoveringOverStart'])
    makeObservable(this, {
      processBounds: action,
      addPoint: action,
      pointerNearStart: action,
    })
  }

  addPoint(pointerVector) {
    // return true if path should be "committed"
    // path can also be commited without closing it, by pressing Escape
    if (this.hoveringOverStart) {
      this.closed = true
      this.hoveringOverStart = false
      return true
    }

    // TODO [4]: This is a bit much, we technically only need to de-translate the point,
    // the scale and rotation don't affect mapping the point from global to local
    // and calculating this on every addPoint is probabaly not needed
    // AKA -- let's memoize the parentTranslation during point-adding
    const parentTransform = Path.rootContainer.findParent(this.id).currentTransform
    const pointInCanvasSpace = DOMMatrix
      .fromMatrix(parentTransform)
      .invertSelf()
      .translateSelf(...pointerVector.values)

    const thisPoint = new Point(pointInCanvasSpace.e, pointInCanvasSpace.f)
    // TODO [1]: If user drags their mouse while placing a point, use the
    //           total drag offset X&Y as the controlOut X&Y

    this.points.push(thisPoint)
    return false
  }

  pointerNearStart(pointerVector) {
    const parentTransform = Path.rootContainer.findParent(this.id).currentTransform
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
    // NOTE: if you ever allow this method to run after keyframes exist,
    // make sure to pass store.animation.now to setOrigin
    this.setOrigin(new Vector2(...poleOfInaccessibility))
  }

  calculateDirection() {
    const totalArea = this.points.reduce((accum, point, index) => {
      const nextIdx = index + 1 === this.points.length ? 0 : index + 1
      const nextPoint = this.points[nextIdx]
      return accum + ((nextPoint.x - point.x) * (nextPoint.y + point.y))
    }, 0)
    if (totalArea > 0) {
      this.direction = Path.DIRECTIONS.COUNTER_CLOCKWISE
    }
  }

  commitPath() {
    this.calculateOrigin()
    this.pointsVisible = false
    this.calculateDirection()
  }

  processBounds() {
    // TODO [3]: this only needs to run when this.points changes, not during draw

    if (this.points.length === 0) {
      this._width.setValue(0)
      this._height.setValue(0)
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

    this._width.setValue(maxX - minX)
    this._height.setValue(maxY - minY)
    return [minX, minY]
  }

  get rectSpec() {
    const topLeft = this.processBounds()
    return [topLeft[0], topLeft[1], this.width, this.height]
  }

  checkPointerIntersections(pointerVector) {
    this.ctx.setTransform(this.currentTransform)
    this.drawPath()

    // make a fake stroke around the path to check for "near" intersections
    this.ctx.lineWidth = 16
    if (this.ctx.isPointInStroke(...pointerVector.values)) return true

    // If path has a fill, check for inside intersections as well
    if (this.fillOpacity > 0) {
      if (this.ctx.isPointInPath(...pointerVector.values)) return true
    }

    return false
  }

  checkSelectedItemHandleIntersections(pointerVector) {
    return super.checkSelectedItemHandleIntersections(pointerVector, false)
  }

  checkPointAndControlIntersections(pointerVector) {
    const someFound = this.points.some((point, index) => {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(...point.values)
      this.ctx.beginPath()
      setPointRectOnCtx(this.ctx, true)
      if (this.ctx.isPointInPath(...pointerVector.values)) {
        Path.rootContainer.store.build.setHoveredPoint(`point--${this.id}--${index}`)
        return true
      }

      let controlIdxIntersection = null
      point.controlPoints.some((controlPoint, controlIdx) => {
        this.ctx.setTransform(this.currentTransform)
        this.ctx.translate(...controlPoint.values)
        this.ctx.beginPath()
        setControlPointEllipseOnCtx(this.ctx, true)
        if (this.ctx.isPointInPath(...pointerVector.values)) {
          controlIdxIntersection = controlIdx
          return true
        }
        return false
      })
      if (controlIdxIntersection != null) {
        const pointId = `controlpoint--${this.id}--${index}--${controlIdxIntersection}`
        Path.rootContainer.store.build.setHoveredPoint(pointId)
        return true
      }

      return false
    })

    if (!someFound) {
      Path.rootContainer.store.build.setHoveredPoint(null)
    }
  }

  moveActivePointByIncrement(movementVector) {
    const { activePoint } = Path.rootContainer.store.build
    const [_, itemId, pointIdx, controlIdx] = activePoint?.split('--') || []
    if (itemId !== this.id) return

    const ownTransformInverse = DOMMatrix.fromMatrix(this.currentTransform).invertSelf()
    const { a, b, c, d } = ownTransformInverse
    const { x, y } = movementVector
    const relativeMovementScaledToOwnTransform = new Vector2(x * a + y * c, x * b + y * d)

    const targetPoint = this.points[pointIdx]
    if (controlIdx) {
      // Move a Control Point
      const controlPointName = Point.CONTROL_POINT_NAMES[controlIdx]
      targetPoint.moveControlPointBy(
        controlPointName,
        relativeMovementScaledToOwnTransform.x,
        relativeMovementScaledToOwnTransform.y,
      )
    } else if (pointIdx) {
      // Move the Point itself, and force the control points to follow
      targetPoint.movePointBy(...relativeMovementScaledToOwnTransform.values)
    }
  }

  blastControlPoints(pointId) {
    if (!pointId.startsWith('point--')) return
    const [_, itemId, pointIdxStr] = pointId.split('--')
    if (itemId !== this.id) return

    const pointIdx = parseInt(pointIdxStr, 10)
    const targetPoint = this.points[pointIdx]
    const controlPointsAreZeroed = targetPoint.controlPoints.every((controlPoint) => (
      controlPoint.x === targetPoint.x && controlPoint.y === targetPoint.y
    ))

    // TODO [4]: add blast handling for 2-pointed bezier paths
    //           we should ignore blasting if it would create two overlapping straight lines
    if (this.points === 2) return

    if (!controlPointsAreZeroed) {
      targetPoint.zeroOutControlPoints()
      return
    }

    const nextIdx = pointIdx + 1 === this.points.length ? 0 : pointIdx + 1
    const nextPoint = this.points[nextIdx]
    const prevIdx = pointIdx === 0 ? this.points.length - 1 : pointIdx - 1
    const prevPoint = this.points[prevIdx]
    const vectorToNext = Vector2.subtract(nextPoint, targetPoint)
    const vectorToPrev = Vector2.subtract(prevPoint, targetPoint)

    const absoluteAngleBetween = (
      Angle.vectorUnitCircleAngle(...vectorToNext.values).degrees
      - Angle.vectorUnitCircleAngle(...vectorToPrev.values).degrees
    )
    const positiveAngleBetween = Vector2.angleBetween(vectorToNext, vectorToPrev)
    const halfwayRotation = positiveAngleBetween / 2
    let halfwayRotationDirection = this.direction
    let tangentialDirection = Math.PI / 2
    if (this.direction === Path.DIRECTIONS.COUNTER_CLOCKWISE) {
      tangentialDirection = -1 * (Math.PI / 2)
    }

    // Check for a convex connection between points, and reverse rotation direction
    //  - clockwise: convex is less than -180 OR between 0 and 180
    //  - counterclockwise: convex is greater than 180 or between -180 and 0
    if ((
      this.direction === Path.DIRECTIONS.CLOCKWISE && (
        absoluteAngleBetween < -180
        || (absoluteAngleBetween > 0 && absoluteAngleBetween < 180)
      )
    ) || (
      this.direction === Path.DIRECTIONS.COUNTER_CLOCKWISE && (
        absoluteAngleBetween > 180
        || (absoluteAngleBetween > -180 && absoluteAngleBetween < 0)
      )
    )) {
      halfwayRotationDirection *= -1
      tangentialDirection += Math.PI
    }

    vectorToNext.rotate(halfwayRotationDirection * halfwayRotation)
    const rightToTangent = Angle.vectorUnitCircleAngle(...vectorToNext.values)
    const blastAngle = (rightToTangent.radians + tangentialDirection) % 360

    targetPoint.blastOutControlPoints(blastAngle)
  }

  detatchControlPoints(pointId) {
    const [_, __, pointIdx] = pointId.split('--')
    this.points[parseInt(pointIdx, 10)].controlsCollinear = false
  }

  /* All Drawing Operations below here */

  drawPath() {
    this.ctx.beginPath()
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
      this.ctx.closePath()
    }
  }

  drawHoveredIndicator() {
    drawHoveredIndicatorPath(this)
  }

  drawControllerBox(handleIdxHovered, handleIdxActive) {
    drawControllerCenter(this, handleIdxHovered, handleIdxActive)
  }

  drawPoints(pointIndexHovered) {
    this.points.forEach((point, index) => {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(...point.values)
      const isHovered = (
        index === pointIndexHovered
        || (index === 0 && this.hoveringOverStart)
      )
      drawPathPoint(this.ctx, isHovered)
    })
  }

  drawControlPoints(controlPointIndexHovered) {
    this.points.forEach((point, pointIdx) => {
      point.controlPoints.forEach((controlPoint, controlPointIdx) => {
        this.ctx.setTransform(this.currentTransform)
        this.ctx.translate(...controlPoint.values)
        const isHovered = (
          controlPointIndexHovered[0] === pointIdx
          && controlPointIndexHovered[1] === controlPointIdx
        )
        drawPathControlPoint(this.ctx, isHovered)
        const relativeEndpoint = Vector2.subtract(point, controlPoint)
        drawPathControlLine(this.ctx, ...relativeEndpoint.values, isHovered)
      })
    })
  }

  /*
    TODO [4]: add a custom findRectIntersections() implementation that works
    more similarly to checkPointerIntersections. Currently it checks against
    the rectSpec which doesn't account for concave path paths and/or holes
  */

  drawShape(isHovered, isSelected) {
    if (this.points.length === 0) return

    super.drawShape()

    if (!this.pointsVisible && !isSelected) return

    const { hoveredPoint, isSelectionOneCompletePath } = Path.rootContainer.store.build
    // TODO [4]: change this to check both hoveredPoint or activePoint so that
    //           the hover color doesn't flicker when quicking moving a point

    let pointIndexHovered
    if (hoveredPoint?.startsWith('point--')) {
      const [_, itemId, pointIdx] = hoveredPoint.split('--')
      if (itemId === this.id) {
        pointIndexHovered = parseInt(pointIdx, 10)
      }
    }
    this.drawPoints(pointIndexHovered)

    if (!isSelectionOneCompletePath) return

    let controlPointIndexHovered = []
    if (hoveredPoint?.startsWith('controlpoint--')) {
      const [_, itemId, pointIdx, controlIdx] = hoveredPoint.split('--')
      if (itemId === this.id) {
        controlPointIndexHovered = [parseInt(pointIdx, 10), parseInt(controlIdx, 10)]
      }
    }
    this.drawControlPoints(controlPointIndexHovered)
  }
}

export default Path
