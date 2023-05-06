import { makeObservable, action } from 'mobx'

import Animatable from './Animatable'
import Size from '../structure/Size'
import Color from '../visuals/Color'
import Fill from '../visuals/Fill'
import Stroke from '../visuals/Stroke'
import Shadow from '../visuals/Shadow'
import { observeListOfProperties } from '../utility/state'

class Shape extends Animatable {
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
    this.name = `${shapeType}-${this.name}`
    this.size = new Size(width, height)

    this.fill = new Fill(Color.randomPastel())
    this.stroke = new Stroke()
    this.shadow = new Shadow()

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'size', 'fill', 'stroke', 'shadow']
    this._nestedObservables = [...super.nestedObservables, 'size', 'fill', 'stroke', 'shadow']
    observeListOfProperties(this, this.observables, inheritedObservables)
    makeObservable(this, { checkPointerIntersections: action })
  }

  get width() { return this.size.width }
  set width(value) { this.size.width = value }
  get height() { return this.size.height }
  set height(value) { this.size.height = value }

  drawHoveredRect(rectSpec, isHovered, isSelected) {
    if (!isHovered || isSelected) return

    const lineWidth = 2 * this.DPR
    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    const strokeProtrusion = this.stroke.width / 2
    this.ctx.rect(
      rectSpec[0] - strokeProtrusion - ((lineWidth / 2) / this.scale.x),
      rectSpec[1] - strokeProtrusion - ((lineWidth / 2) / this.scale.y),
      rectSpec[2] + this.stroke.width + (lineWidth / this.scale.x),
      rectSpec[3] + this.stroke.width + (lineWidth / this.scale.y),
    )
    this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.8)'
    this.ctx.lineWidth = lineWidth
    this.ctx.setTransform(this.currentTransformWithoutScale)
    this.ctx.stroke()
  }

  createIntersectionsPath() {
    // overwrite this if your shape doesn't use a rectangle for intersections
    const rectSpec = [
      this.width / -2 - (this.stroke.width / 2),
      this.height / -2 - (this.stroke.width / 2),
      this.width + this.stroke.width,
      this.height + this.stroke.width,
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
    this.ctx.setTransform(this.currentTransform)
    const strokeProtrusion = this.stroke.width / 2
    this.ctx.translate(
      this.width / -2 - strokeProtrusion,
      this.height / -2 - strokeProtrusion,
    )
    const finalTransform = this.ctx.getTransform()
    this.ctx.translate(this.width + this.stroke.width, this.height + this.stroke.width)
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
