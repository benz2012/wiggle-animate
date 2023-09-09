import { makeObservable, action } from 'mobx'

import Shape from '../drawing/Shape'
import Property from '../structure/Property'

class Text extends Shape {
  constructor(...args) {
    super('text', ...args)

    this._text = new Property({
      type: Property.PRIMITIVES.STRING,
      value: this.name.value,
      isEditable: true,
      isKeyframable: true,
    })
    this._fontSize = new Property({
      type: Property.PRIMITIVES.INTEGER,
      value: 100,
      isEditable: true,
      isKeyframable: true,
    })
    this._font = new Property({
      type: Property.PRIMITIVES.STRING,
      value: 'sans-serif',
      isEditable: true,
    })

    // These mess with drawing operations too much, lock these in but allow normal
    // rectangular/shape alignment to contribute
    this._width.isEditable = false
    this._width.isKeyframable = false
    this._height.isEditable = false
    this._height.isKeyframable = false
    this.baseline = 'middle'
    this.align = 'center'

    // other non-editible features
    this.direction = 'ltr'
    this.middleToTop = 0

    makeObservable(this, { measureAndSetSize: action })
  }

  get text() { return this._text }
  get fontSize() { return this._fontSize }
  get font() { return this._font }

  measureAndSetSize() {
    const metrics = this.ctx.measureText(this.text.value)
    this._width.setValue(metrics.width)
    this._height.setValue(metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent)
    this.middleToTop = metrics.fontBoundingBoxAscent
  }

  drawShape() {
    this.ctx.font = `${this.fontSize.value}px ${this.font.value}`
    this.ctx.textAlign = this.align
    this.ctx.textBaseline = this.baseline
    this.ctx.direction = this.direction
    this.measureAndSetSize()

    // Since the browser doesn't draw "middle" in the true middle, offset the drawing
    // so that the text boundaries align 1:1 with the bounding box that we plan to
    // draw based on position with width & height
    this.ctx.translate(0, this.middleToTop - (this.height / 2))

    // Adjust for rectangular/shape alignment
    const [rectX, rectY, rectW, rectH] = this.rectSpec
    this.ctx.translate(rectX + rectW / 2, rectY + rectH / 2)

    this.ctx.beginPath()
    this.shadow.prepare(this.ctx)
    this.stroke.prepare(this.ctx)
    this.ctx.strokeText(this.text.value, 0, 0)
    this.fill.prepare(this.ctx)
    this.ctx.fillText(this.text.value, 0, 0)
  }
}

export default Text
