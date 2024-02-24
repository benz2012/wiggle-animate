import { makeObservable, action } from 'mobx'

import Drawable from './Drawable'
import Property from '../structure/Property'
import Alignment from '../structure/Alignment'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import {
  drawHoveredIndicator,
  drawControllerBox,
  drawControllerCenter,
  setControllerHandleRectOnCtx,
  setControllerHandleEllipseOnCtx,
  octantCursorMap,
} from '../../utility/drawing'
import {
  doAxisAlignedRectanglesOverlap,
  doLineSegmentsIntersect,
} from '../../utility/intersections'

class Shape extends Drawable {
  static get className() { return 'Shape' }

  constructor(x = 0, y = 0, width = 100, height = 100) {
    super(x, y)

    this._width = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: width,
      isEditable: true,
      group: 'size',
      order: 2,
      minValue: 0,
      isKeyframable: true,
    })
    this._height = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: height,
      isEditable: true,
      group: 'size',
      order: 2,
      minValue: 0,
      isKeyframable: true,
    })
    this._alignment = new Property({
      type: Alignment,
      isEditable: true,
      group: 'transform',
      order: 1,
    })

    makeObservable(this, { checkPointerIntersections: action })
  }

  get width() { return this._width.value }
  get height() { return this._height.value }
  get alignment() { return this._alignment.value }

  get rectSpec() {
    // Defaults are for [CENTER, CENTER]
    let xLocation = this.width / -2
    let yLocation = this.height / -2

    if (this.alignment.x === Alignment.LEFT) {
      xLocation = 0
    } else if (this.alignment.x === Alignment.RIGHT) {
      xLocation = this.width * -1
    }
    if (this.alignment.y === Alignment.TOP) {
      yLocation = 0
    } else if (this.alignment.y === Alignment.BOTTOM) {
      yLocation = this.height * -1
    }

    return [xLocation, yLocation, this.width, this.height]
  }

  drawShape() {
    // this will be overwritten in the VisibleShape subclass
    return this
  }

  draw(parentTransform, isHovered, isSelected, handleIdxHovered, handleIdxActive) {
    super.draw(parentTransform)

    this.drawShape(isHovered, isSelected)

    if (isSelected) {
      this.drawControllerBox(handleIdxHovered, handleIdxActive)
    } else if (isHovered) {
      this.drawHoveredIndicator()
    }
  }

  drawHoveredIndicator() {
    // Allows being overwritten by subclass
    drawHoveredIndicator(this)
  }

  drawControllerBox(handleIdxHovered, handleIdxActive) {
    // TODO [3]: add a setting to allow controller handles to be hidden
    // Allows being overwritten by subclass
    drawControllerBox(this, handleIdxHovered, handleIdxActive)
    drawControllerCenter(this, handleIdxHovered, handleIdxActive)
  }

  createIntersectionsPath() {
    // overwrite this if your shape doesn't use a rectangle for intersections
    const rectSpec = [
      this.rectSpec[0] - (this.strokeWidth / 2),
      this.rectSpec[1] - (this.strokeWidth / 2),
      this.rectSpec[2] + this.strokeWidth,
      this.rectSpec[3] + this.strokeWidth,
    ]
    this.ctx.rect(...rectSpec)
    return rectSpec
  }

  checkPointerIntersections(pointerVector) {
    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    this.createIntersectionsPath()
    if (this.ctx.isPointInPath(...pointerVector.values)) return true
    return false
  }

  checkSelectedItemHandleIntersections(pointerVector, checkRectHandles = true) {
    const nullReturn = [false, null, null]
    let handleIdxIntersected = null
    let handleRectSpec = null
    const rectHandleIndicies = checkRectHandles ? [0, 1, 2, 3] : []

    rectHandleIndicies.some((handleIdx) => {
      if (this.controllerType === 'Line' && handleIdx > 1) return false

      this.ctx.setTransform(this.currentTransform)
      this.ctx.beginPath()
      handleRectSpec = setControllerHandleRectOnCtx(this, handleIdx, true)
      if (this.ctx.isPointInPath(...pointerVector.values)) {
        handleIdxIntersected = handleIdx
        return true
      }

      return false
    })

    // Now check the rotation handle if needed
    if (handleIdxIntersected === null) {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.beginPath()
      setControllerHandleEllipseOnCtx(this, 100, true)
      if (this.ctx.isPointInPath(...pointerVector.values)) {
        handleIdxIntersected = 100
      }
    }

    if (handleIdxIntersected == null) {
      return nullReturn
    }
    if (rectHandleIndicies.includes(handleIdxIntersected)) {
      // TODO [3]: don't base octet on item position, instead use the angle between the two conjoining edges
      //       however you will need to backtrack for special alignment cases
      //       -- not so sure on this one. I need to see a more specific case where it would help
      const [handleX, handleY, handleW, handleH] = handleRectSpec
      const handleCenterPoint = new Vector2(handleX + handleW / 2, handleY + handleH / 2)
      const handlePointInGlobalSpace = this.currentTransform.translateSelf(...handleCenterPoint.values)
      const offsetX = handlePointInGlobalSpace.e - this.currentTransform.e
      const offsetY = this.currentTransform.f - handlePointInGlobalSpace.f
      const octant = Angle.vectorOctant(offsetX, offsetY)
      const cursor = octantCursorMap[octant]
      return [true, handleIdxIntersected, cursor]
    }
    if (handleIdxIntersected === 100) {
      return [true, handleIdxIntersected, 'rotate']
    }

    return nullReturn
  }

  calculateGlobalBoundingBox() {
    /* This function calculates an "upright" rectangle that encapsulates the shape and also returns
     * the global points used to calculate that upright rect which will represent the resolved rotation
     * Note: this expects your createIntersectionsPath to be a rectSpec
     */
    const [startingX, startingY, width, height] = this.createIntersectionsPath()

    const topLeft = this.transformPointToGlobalSpace(startingX, startingY)
    const topRight = this.transformPointToGlobalSpace(startingX + width, startingY)
    const bottomRight = this.transformPointToGlobalSpace(startingX + width, startingY + height)
    const bottomLeft = this.transformPointToGlobalSpace(startingX, startingY + height)
    const allXPoints = [topLeft.x, topRight.x, bottomRight.x, bottomLeft.x]
    const allYPoints = [topLeft.y, topRight.y, bottomRight.y, bottomLeft.y]

    return [
      Math.min(...allXPoints), Math.min(...allYPoints), // Top Left Global Point
      Math.max(...allXPoints), Math.max(...allYPoints), // Bottom Right Global Point
      topLeft, topRight, bottomRight, bottomLeft,
    ]
  }

  findRectIntersections(otherRectTLBR) {
    /* This function is used to find if the Shape object is intersecting or within the bounds of another Rectangle.
     * Most notably, the selection rectangle that the user can drag-and-draw on the stage
     * Notations: TL = Top Left, TR = Top Right, BR = Bottom Right, BL = Bottom Left
     *            or = other rectangle, bb = Bounding Box, gp = Global Point Rectangle
     */
    const trueResult = [this.id]
    const falseResult = []

    const [orTLx, orTLy, orBRx, orBRy] = otherRectTLBR
    const [bbTLx, bbTLy, bbBRx, bbBRy, gpTL, gpTR, gpBR, gpBL] = this.calculateGlobalBoundingBox()
    const hasAxisAlignedOverlap = doAxisAlignedRectanglesOverlap(
      { x1: orTLx, y1: orTLy, x2: orBRx, y2: orBRy },
      { x1: bbTLx, y1: bbTLy, x2: bbBRx, y2: bbBRy },
    )

    if (!hasAxisAlignedOverlap) return falseResult

    // Now that we know there is boundingBox overlap, check more specifically
    // for intersections with the rotated rectSpec that's inside the bounding box
    const hasSomeLineInsideRect = [gpTL, gpTR, gpBR, gpBL].some((point) => (
      orTLx < point.x && point.x < orBRx
      && orTLy < point.y && point.y < orBRy
    ))
    if (hasSomeLineInsideRect) return trueResult

    const globalRectLineSegments = [
      [gpTL.object, gpTR.object],
      [gpTR.object, gpBR.object],
      [gpBL.object, gpBR.object],
      [gpTL.object, gpBL.object],
    ]
    const otherRectLineSegments = [
      [{ x: orTLx, y: orTLy }, { x: orBRx, y: orTLy }],
      [{ x: orBRx, y: orTLy }, { x: orBRx, y: orBRy }],
      [{ x: orTLx, y: orBRy }, { x: orBRx, y: orBRy }],
      [{ x: orTLx, y: orTLy }, { x: orTLx, y: orBRy }],
    ]

    const hasSomeLineIntersection = otherRectLineSegments.some((otherRectLineSegment) => (
      globalRectLineSegments.some((globalRectLineSegment) => (
        doLineSegmentsIntersect(...otherRectLineSegment, ...globalRectLineSegment)
      ))
    ))
    if (hasSomeLineIntersection) return trueResult

    return falseResult
  }
}

export default Shape
