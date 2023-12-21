import { makeObservable, action } from 'mobx'

import VisibleShape from '../drawing/VisibleShape'
import Property from '../structure/Property'
import Selection from '../structure/Selection'

// TODO [2]: Actual Fonts
// Add these loaded fonts to the Project store
// this will allow us to load all the ones being used when a project opens
// every time a font is loaded, re-render the canvas

// it would be better for performance to host all these fonts myself, but that could add a lot to
// data hostage download costs in the future, so I think I'll stick to CDN even though it's slower

// For interface, I think we just have it be a clickable box that shows the current font
// clicking that opens a modal which will show a list of fonts used in the project first
// it will also have tabs for allowing you to browser through them: Sans-Serif, Serif, Monospace, etc
// and at the top of it all will be a search bar
// selecting a font closes the modal and sets the value on the text object
// I think maybe to make it easier on the user, the clickable box will be all fonts that they added
// to that project, and then I'll put a little plus button next to it that will open the modal

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
    this._action = new Property({
      type: Property.PRIMITIVES.STRING, // make a new property-type called Button,
      value: '+ Add Fonts',
      isEditable: true,
      group: 'font',
      label: '',
    })
    this._font = new Property({
      type: Selection,
      value: ['sans-serif', 'serif', 'monospace', 'Roboto'],
      isEditable: true,
      group: 'font',
      label: 'typeface',
    })
    this._fontStyle = new Property({
      type: Selection,
      value: ['regular', 'italic'],
      isEditable: true,
      group: 'font',
      label: 'style',
    })
    this._fontWeight = new Property({
      type: Selection,
      value: ['400 - Normal', '200 - Light', '600 - Bold', '800 - Black'],
      isEditable: true,
      group: 'font',
      label: 'weight',
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
    this._name.isEditable = false
    this.direction = 'ltr'
    this.middleToTop = 0

    makeObservable(this, { measureAndSetSize: action })
  }

  get text() { return this._text.value }
  get fontSize() { return this._fontSize.value }
  get font() { return this._font.value.selected }
  get fontStyle() { return this._fontStyle.value.selected }
  get fontWeight() { return this._fontWeight.value.selected }

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
