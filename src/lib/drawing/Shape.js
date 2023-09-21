import { makeObservable, action } from 'mobx'

import Drawable from './Drawable'
import Property from '../structure/Property'
import Alignment from '../structure/Alignment'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import {
  drawHoveredIndicator,
  drawControllerBox,
  clearShadowContext,
  setControllerHandleRectOnCtx,
  octantCursorMap,
} from '../../utility/drawing'

class Shape extends Drawable {
  static get className() { return 'Shape' }
  static doRectsOverlap(a, b) {
    /* Check if rectangle A overlaps rectangle B, or vise-versa
     * requires top-left corner (x1, y1) & bottom-right corner (x2, y2)
     */
    if (a.x1 >= b.x2 || b.x1 >= a.x2) return false // no horizontal overlap
    if (a.y1 >= b.y2 || b.y1 >= a.y2) return false // no vertical overlap
    return true
  }

  constructor(shapeType = '', x = 0, y = 0, width = 100, height = 100) {
    super(x, y)
    this._name.setValue(`${shapeType}-${this.name}`)

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
    // overwrite this method in your subclass
    return this
  }

  draw(parentTransform, isHovered, isSelected, handleIdxHovered, handleIdxActive) {
    super.draw(parentTransform)

    this.drawShape(isHovered, isSelected)
    clearShadowContext(this.ctx)

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
    // Allows being overwritten by subclass
    drawControllerBox(this, handleIdxHovered, handleIdxActive)
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
  }

  checkPointerIntersections(pointerVector) {
    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    this.createIntersectionsPath()
    if (this.ctx.isPointInPath(...pointerVector.values)) return true
    return false
  }

  checkSelectedItemHandleIntersections(pointerVector) {
    const nullReturn = [false, null, null]

    let handleRectSpec = null
    const handleIntersected = [0, 1, 2, 3].find((handleIdx) => {
      if (this.controllerType === 'Line' && handleIdx > 1) return false

      this.ctx.setTransform(this.currentTransform)
      this.ctx.beginPath()
      handleRectSpec = setControllerHandleRectOnCtx(this, handleIdx, true)
      if (this.ctx.isPointInPath(...pointerVector.values)) return true

      return false
    })

    if (handleIntersected != null) {
      const [handleX, handleY, handleW, handleH] = handleRectSpec
      const handleCenterPoint = new Vector2(handleX + handleW / 2, handleY + handleH / 2)
      const handlePointInGlobalSpace = this.currentTransform.translateSelf(...handleCenterPoint.values)
      const offsetX = handlePointInGlobalSpace.e - this.currentTransform.e
      const offsetY = this.currentTransform.f - handlePointInGlobalSpace.f
      const octant = Angle.vectorOctant(offsetX, offsetY)
      const cursor = octantCursorMap[octant]
      return [true, handleIntersected, cursor]
    }

    return nullReturn
  }

  findRectIntersections(rectSpecTLBR) {
    // TODO: this doesn't work properly when items are rotated or scaled.
    //       currently only used for the Rectangle-Selector-Box-Action
    this.ctx.setTransform(this.currentTransform)
    const strokeProtrusion = this.strokeWidth / 2
    this.ctx.translate(
      this.rectSpec[0] - strokeProtrusion,
      this.rectSpec[1] - strokeProtrusion,
    )
    const finalTransform = this.ctx.getTransform()
    this.ctx.translate(
      this.rectSpec[2] + this.strokeWidth,
      this.rectSpec[3] + this.strokeWidth
    )
    const bottomLeftTransform = this.ctx.getTransform()

    const hasOverlap = Shape.doRectsOverlap({
      x1: rectSpecTLBR[0],
      y1: rectSpecTLBR[1],
      x2: rectSpecTLBR[2],
      y2: rectSpecTLBR[3],
    }, {
      x1: finalTransform.e,
      y1: finalTransform.f,
      x2: bottomLeftTransform.e,
      y2: bottomLeftTransform.f,
    })
    if (hasOverlap) return [this.id]
    return []
  }
}

export default Shape
