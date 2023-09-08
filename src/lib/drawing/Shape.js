import { makeObservable, action } from 'mobx'

import Drawable from './Drawable'
import Property from '../structure/Property'
import Size from '../structure/Size'
import Alignment from '../structure/Alignment'
import Color from '../visuals/Color'
import Fill from '../visuals/Fill'
import Stroke from '../visuals/Stroke'
import Shadow from '../visuals/Shadow'
import { drawHoveredIndicator, drawControllerBox } from '../../utility/drawing'

class Shape extends Drawable {
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
    this.name.setValue(`${shapeType}-${this.name}`)

    this._size = new Property({
      type: Size,
      value: [width, height],
    })
    this._alignment = new Property({ type: Alignment })

    // TODO: these are not yet fully fleshed out with the new Property system
    //       maybe observing things wrong, and also can't keyframe on sub-property
    //       like fill.opacity
    // Would like unique keyframes for the following:
    // width, height, fill.color, fill.opacity, stroke.color, stroke.opacity,
    // stroke.width, shadow.color, shadow.opacity, shadow.blur, shadow.offset
    this.fill = new Fill(Color.randomPastel())
    this.stroke = new Stroke()
    this.shadow = new Shadow()

    makeObservable(this, { checkPointerIntersections: action })
  }

  get size() { return this._size }
  get alignment() { return this._alignment }

  get width() { return this.size.value.width }
  set width(value) { this.size.value.width = value }
  get height() { return this.size.value.height }
  set height(value) { this.size.value.height = value }

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

  draw(parentTransform, isHovered, isSelected) {
    super.draw(parentTransform)

    this.drawShape(isHovered, isSelected)
    Shadow.clear(this.ctx)

    if (isSelected) {
      this.drawControllerBox()
    } else if (isHovered) {
      this.drawHoveredIndicator()
    }
  }

  drawHoveredIndicator() {
    // Allows being overwritten by subclass
    drawHoveredIndicator(this)
  }

  drawControllerBox() {
    // Allows being overwritten by subclass
    drawControllerBox(this)
  }

  createIntersectionsPath() {
    // overwrite this if your shape doesn't use a rectangle for intersections
    const rectSpec = [
      this.rectSpec[0] - (this.stroke.width / 2),
      this.rectSpec[1] - (this.stroke.width / 2),
      this.rectSpec[2] + this.stroke.width,
      this.rectSpec[3] + this.stroke.width,
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

  findRectIntersections(rectSpecTLBR) {
    // TODO: this doesn't work properly when items are rotated or scaled
    this.ctx.setTransform(this.currentTransform)
    const strokeProtrusion = this.stroke.width / 2
    this.ctx.translate(
      this.rectSpec[0] - strokeProtrusion,
      this.rectSpec[1] - strokeProtrusion,
    )
    const finalTransform = this.ctx.getTransform()
    this.ctx.translate(
      this.rectSpec[2] + this.stroke.width,
      this.rectSpec[3] + this.stroke.width
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
