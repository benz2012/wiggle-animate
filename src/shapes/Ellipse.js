import { makeObservable, action } from 'mobx'

import Shape from '../drawing/Shape'
import Rectangle from './Rectangle'

class Ellipse extends Shape {
  constructor(...args) {
    super(...args)
    this.name = `ellipse-${this.name}`
    makeObservable(this, { checkPointerIntersections: action })
  }

  get currentTransform() {
    return new DOMMatrix(this.parentTransform)
      .translateSelf(this.x, this.y)
      .translateSelf(this.origin.x, this.origin.y)
      .rotateSelf(this.rotation.degrees)
      .scaleSelf(this.scale.x, this.scale.y)
      .translateSelf(-1 * this.origin.x, -1 * this.origin.y)
  }

  get currentTransformWithoutScale() {
    return new DOMMatrix(this.parentTransform)
      .translateSelf(this.x, this.y)
      .translateSelf(this.origin.x, this.origin.y)
      .rotateSelf(this.rotation.degrees)
      .translateSelf(-1 * this.origin.x, -1 * this.origin.y)
  }

  draw(parentTransform, isHovered, isSelected) {
    // TODO: get this somehow else
    this.parentTransform = parentTransform

    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    const rectSpec = [this.width / -2, this.height / -2, this.width, this.height]
    // this.ctx.rect(...rectSpec)
    this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2)

    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
    this.stroke.draw(this.ctx)

    // draw hovered rect
    // TODO: some of this should be abstracted
    if (isHovered && !isSelected) {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.beginPath()
      const strokeProtrusion = this.stroke.width / 2
      this.ctx.rect(
        rectSpec[0] - strokeProtrusion - (2 / this.scale.x),
        rectSpec[1] - strokeProtrusion - (2 / this.scale.y),
        rectSpec[2] + this.stroke.width + (4 / this.scale.x),
        rectSpec[3] + this.stroke.width + (4 / this.scale.y),
      )
      this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.8)'
      this.ctx.lineWidth = 4
      this.ctx.setTransform(this.currentTransformWithoutScale)
      this.ctx.stroke()
    }

    // draw selected controller box
    // TODO: draw this on top of all other items
    if (isSelected) {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.beginPath()
      const strokeProtrusion = this.stroke.width / 2
      this.ctx.rect(
        rectSpec[0] - strokeProtrusion - (3 / this.scale.x),
        rectSpec[1] - strokeProtrusion - (3 / this.scale.y),
        rectSpec[2] + this.stroke.width + (6 / this.scale.x),
        rectSpec[3] + this.stroke.width + (6 / this.scale.y),
      )
      this.ctx.strokeStyle = 'rgba(33, 150, 243)'
      this.ctx.lineWidth = 6
      this.ctx.setTransform(this.currentTransformWithoutScale)
      this.ctx.stroke()

      // handles
      this.ctx.setTransform(this.currentTransform)
      this.ctx.beginPath()
      this.ctx.rect(
        rectSpec[0] - strokeProtrusion - (11 / this.scale.x),
        rectSpec[1] - strokeProtrusion - (11 / this.scale.y),
        16 / this.scale.x,
        16 / this.scale.y,
      )
      this.ctx.rect(
        (rectSpec[0] * -1) + strokeProtrusion - (5 / this.scale.x),
        rectSpec[1] - strokeProtrusion - (11 / this.scale.y),
        16 / this.scale.x,
        16 / this.scale.y,
      )
      this.ctx.rect(
        (rectSpec[0] * -1) + strokeProtrusion - (5 / this.scale.x),
        (rectSpec[1] * -1) + strokeProtrusion - (5 / this.scale.y),
        16 / this.scale.x,
        16 / this.scale.y,
      )
      this.ctx.rect(
        rectSpec[0] - strokeProtrusion - (11 / this.scale.x),
        (rectSpec[1] * -1) + strokeProtrusion - (5 / this.scale.y),
        16 / this.scale.x,
        16 / this.scale.y,
      )
      this.ctx.fillStyle = 'white'
      this.ctx.strokeStyle = 'rgb(33, 150, 243)'
      this.ctx.lineWidth = 6
      this.ctx.setTransform(this.currentTransformWithoutScale)
      this.ctx.fill()
      this.ctx.stroke()

      // origin
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(this.origin.x, this.origin.y)
      this.ctx.beginPath()
      this.ctx.moveTo(0 / this.scale.x, -10 / this.scale.y)
      this.ctx.lineTo(0 / this.scale.x, 10 / this.scale.y)
      this.ctx.moveTo(-10 / this.scale.x, 0 / this.scale.y)
      this.ctx.lineTo(10 / this.scale.x, 0 / this.scale.y)
      this.ctx.lineWidth = 8
      this.ctx.strokeStyle = 'white'
      this.ctx.setTransform(this.currentTransformWithoutScale)
      this.ctx.stroke()
      // --
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(this.origin.x, this.origin.y)
      this.ctx.beginPath()
      this.ctx.moveTo(0 / this.scale.x, -8 / this.scale.y)
      this.ctx.lineTo(0 / this.scale.x, 8 / this.scale.y)
      this.ctx.moveTo(-8 / this.scale.x, 0 / this.scale.y)
      this.ctx.lineTo(8 / this.scale.x, 0 / this.scale.y)
      this.ctx.lineWidth = 4
      this.ctx.strokeStyle = 'rgb(33, 150, 243)'
      this.ctx.setTransform(this.currentTransformWithoutScale)
      this.ctx.stroke()

      // rotation handle
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(0, this.height / -2 + strokeProtrusion)
      this.ctx.beginPath()
      this.ctx.moveTo(0, 0)
      this.ctx.lineTo(0 / this.scale.x, -75 / this.scale.y)
      this.ctx.strokeStyle = 'rgba(33, 150, 243)'
      this.ctx.lineWidth = 6
      this.ctx.setTransform(this.currentTransformWithoutScale)
      this.ctx.stroke()
      // --
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(0, this.height / -2 + strokeProtrusion)
      this.ctx.beginPath()
      this.ctx.ellipse(
        0,
        -75 / this.scale.y,
        8 / this.scale.x,
        8 / this.scale.y,
        0,
        0,
        Math.PI * 2
      )
      this.ctx.fillStyle = 'white'
      this.ctx.strokeStyle = 'rgb(33, 150, 243)'
      this.ctx.lineWidth = 6
      this.ctx.setTransform(this.currentTransformWithoutScale)
      this.ctx.fill()
      this.ctx.stroke()
    }
  }

  checkPointerIntersections(pointerVector, parentTransform) {
    this.parentTransform = parentTransform

    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    // TODO: abstract this into boundingBox or something
    const strokeProtrusion = this.stroke.width / 2
    const rectSpec = [
      this.width / -2 - strokeProtrusion,
      this.height / -2 - strokeProtrusion,
      this.width + this.stroke.width,
      this.height + this.stroke.width,
    ]
    this.ctx.rect(...rectSpec)

    if (this.ctx.isPointInPath(...pointerVector.values)) return true
    return false
  }

  findRectIntersections(rectSpecTLBR, parentTransform) {
    this.parentTransform = parentTransform

    this.ctx.setTransform(this.currentTransform)
    const strokeProtrusion = this.stroke.width / 2
    this.ctx.translate(
      this.width / -2 - strokeProtrusion,
      this.height / -2 - strokeProtrusion,
    )
    const finalTransform = this.ctx.getTransform()
    this.ctx.translate(this.width + this.stroke.width, this.height + this.stroke.width)
    const bottomLeftTransform = this.ctx.getTransform()
    const thisRectSpecTLBR = [
      finalTransform.e,
      finalTransform.f,
      bottomLeftTransform.e,
      bottomLeftTransform.f,
    ]

    const hasOverlap = Rectangle.overlaps({
      x1: rectSpecTLBR[0],
      y1: rectSpecTLBR[1],
      x2: rectSpecTLBR[2],
      y2: rectSpecTLBR[3],
    }, {
      x1: thisRectSpecTLBR[0],
      y1: thisRectSpecTLBR[1],
      x2: thisRectSpecTLBR[2],
      y2: thisRectSpecTLBR[3],
    })
    if (hasOverlap) return [this.id]
    return []
  }
}

export default Ellipse
