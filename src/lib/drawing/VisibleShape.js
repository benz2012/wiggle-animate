import Shape from './Shape'
import Property from '../structure/Property'
import Vector2 from '../structure/Vector2'
import Selection from '../structure/Selection'
import Color from '../visuals/Color'
import Shadow from '../visuals/Shadow'

const OPACITY_DRAG_RATIO = 3

// TODO [4]: Blend Modes

class VisibleShape extends Shape {
  static get className() { return 'VisibleShape' }

  constructor(...args) {
    super(...args)

    this._fillColor = new Property({
      type: Color,
      value: Color.randomPastel(),
      isEditable: true,
      group: 'fill',
      label: 'color',
      order: 3,
      isKeyframable: true,
    })
    this._fillOpacity = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: 100,
      isEditable: true,
      group: 'fill',
      label: 'opacity',
      order: 3,
      minValue: 0,
      maxValue: 100,
      valueDragRatio: OPACITY_DRAG_RATIO,
      isKeyframable: true,
    })

    this._strokeColor = new Property({
      type: Color,
      value: { r: 0, g: 0, b: 0 },
      isEditable: true,
      group: 'stroke',
      label: 'color',
      order: 3,
      isKeyframable: true,
    })
    this._strokeOpacity = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: 100,
      isEditable: true,
      group: 'stroke',
      label: 'opacity',
      order: 3,
      minValue: 0,
      maxValue: 100,
      valueDragRatio: OPACITY_DRAG_RATIO,
      isKeyframable: true,
    })
    this._strokeWidth = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: 0,
      isEditable: true,
      group: 'stroke',
      label: 'width',
      order: 3,
      minValue: 0,
      isKeyframable: true,
    })
    this._strokeJoin = new Property({
      type: Selection,
      value: ['miter', 'bevel', 'round'],
      isEditable: true,
      group: 'stroke',
      label: 'join',
      order: 3,
    })
    this._strokeFlow = new Property({
      type: Selection,
      value: ['outside', 'middle', 'inside'],
      isEditable: false, // TODO [4]: implement these drawing modes
      group: 'stroke',
      label: 'flow',
      order: 3,
    })

    this._shadowColor = new Property({
      type: Color,
      value: { r: 0, g: 0, b: 0 },
      isEditable: true,
      group: 'shadow',
      label: 'color',
      order: 3,
      isKeyframable: true,
    })
    this._shadowOpacity = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: 0,
      isEditable: true,
      group: 'shadow',
      label: 'opacity',
      order: 3,
      minValue: 0,
      maxValue: 100,
      valueDragRatio: OPACITY_DRAG_RATIO,
      isKeyframable: true,
    })
    this._shadowBlur = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: 0,
      isEditable: true,
      group: 'shadow',
      label: 'blur',
      order: 3,
      minValue: 0,
      valueDragRatio: 10,
      isKeyframable: true,
    })
    this._shadowSpread = new Property({
      type: Property.PRIMITIVES.FLOAT,
      value: 0,
      isEditable: true,
      group: 'shadow',
      label: 'spread',
      order: 3,
      minValue: 0,
      isKeyframable: true,
    })
    this._shadowOffset = new Property({
      type: Vector2,
      value: [0, 0],
      isEditable: true,
      group: 'shadow',
      label: 'offset',
      order: 3,
      valueDragRatio: 5,
      isKeyframable: true,
    })

    this.shadow = new Shadow(this)
  }

  get fillColor() { return this._fillColor.value }
  get fillOpacity() { return this._fillOpacity.value }
  get strokeColor() { return this._strokeColor.value }
  get strokeOpacity() { return this._strokeOpacity.value }
  get strokeWidth() { return this._strokeWidth.value }
  get strokeJoin() { return this._strokeJoin.value.selected }
  get strokeFlow() { return this._strokeFlow.value.selected }
  get shadowColor() { return this._shadowColor.value }
  get shadowOpacity() { return this._shadowOpacity.value }
  get shadowBlur() { return this._shadowBlur.value }
  get shadowOffset() { return this._shadowOffset.value }
  get shadowSpread() { return this._shadowSpread.value }

  removeStrokeProperties() {
    this._strokeColor.isEditable = false
    this._strokeColor.isKeyframable = false
    this._strokeOpacity.isEditable = false
    this._strokeOpacity.isKeyframable = false
    this._strokeWidth.isEditable = false
    this._strokeWidth.isKeyframable = false
    this._strokeJoin.isEditable = false
    this._strokeFlow.isEditable = false
  }

  prepareFill({ overrideColor, overrideOpacity } = {}) {
    const fillColor = overrideColor ?? this.fillColor
    const fillOpacity = overrideOpacity ?? this.fillOpacity
    this.ctx.fillStyle = fillColor.toStringExternalAlpha(fillOpacity / 100)
  }

  drawFill(overrides) {
    // TODO [4]: gradients (+Text submethod)
    this.prepareFill(overrides)
    this.ctx.fill()
  }

  prepareStroke({ overrideColor, overrideOpacity, overrideWidth } = {}) {
    const strokeColor = overrideColor ?? this.strokeColor
    const strokeOpacity = overrideOpacity ?? this.strokeOpacity
    const strokeWidth = overrideWidth ?? this.strokeWidth

    this.ctx.strokeStyle = strokeColor.toStringExternalAlpha(strokeOpacity / 100)
    this.ctx.lineWidth = strokeWidth
    this.ctx.lineJoin = this.strokeJoin
    // TODO [4]: tweak the drawing stack so that these 3 options are possible
    //       this could get complicted depending on shape, we'll see
    //       might need to draw/cut 1 less pixel otherwise there could be a subpixel/gpu gap line
    //       - middle = default
    //       - inside = draw width*2, cut mask around shape
    //       - outside = draw width*2, cut subtraction within shape
  }

  drawStroke(overrides = {}) {
    // TODO [4]: gradients (+Text submethod)
    this.prepareStroke(overrides)
    if (
      !overrides.overrideWidth
      && (this.strokeOpacity === 0 || this.strokeWidth === 0)
    ) return
    this.ctx.stroke()
  }

  drawShadow() {
    if (this.shadowOpacity === 0) return
    this.shadow.draw()
  }

  drawPath() {
    // NOTE: Overwrite this method in your subclass
    return this
  }

  drawShape() {
    this.drawShadow()
    this.drawPath()
    this.drawStroke()
    this.drawFill()
  }
}

export default VisibleShape
