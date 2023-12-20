import { makeObservable, action } from 'mobx'

import VisibleShape from '../drawing/VisibleShape'
import Property from '../structure/Property'

// TODO [2]: Actual Fonts

class Text extends VisibleShape {
  static get className() { return 'Text' }

  constructor(...args) {
    super('text', ...args)

    this._text = new Property({
      type: Property.PRIMITIVES.STRING,
      value: this.name,
      isEditable: true,
      isKeyframable: true,
    })
    this._font = new Property({
      type: Property.PRIMITIVES.STRING,
      value: 'sans-serif',
      isEditable: true,
      group: 'font',
      label: 'typeface',
    })
    this._fontSize = new Property({
      type: Property.PRIMITIVES.INTEGER,
      value: 100,
      isEditable: true,
      group: 'font',
      label: 'size',
      minValue: 0,
      maxValue: 10000,
      isKeyframable: true,
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

  get text() { return this._text.value }
  get fontSize() { return this._fontSize.value }
  get font() { return this._font.value }

  measureAndSetSize() {
    const metrics = this.ctx.measureText(this.text)
    this._width.setValue(metrics.width)
    this._height.setValue(metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent)
    this.middleToTop = metrics.fontBoundingBoxAscent
  }

  drawPath() {
    this.ctx.font = `${this.fontSize}px ${this.font}`
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
  }

  drawStroke(overrides = {}) {
    this.prepareStroke(overrides)
    if (this.strokeOpacity === 0) return
    if (overrides.overrideWidth ?? this.strokeWidth > 0) {
      // Apparently strokeWidth of 0 actually uses like 5, so we block it
      this.ctx.strokeText(this.text, 0, 0)
    }
  }

  drawFill(overrides) {
    this.prepareFill(overrides)
    this.ctx.fillText(this.text, 0, 0)
  }
}

export default Text
