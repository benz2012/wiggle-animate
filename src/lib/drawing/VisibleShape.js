import Shape from './Shape'
import Property from '../structure/Property'
import Vector2 from '../structure/Vector2'
import Selection from '../structure/Selection'
import Color from '../visuals/Color'

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
      value: 0,
      isEditable: true,
      group: 'stroke',
      label: 'opacity',
      order: 3,
      minValue: 0,
      maxValue: 100,
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
      isEditable: false, // TODO: implement these drawing modes
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
      isKeyframable: true,
    })
    this._shadowOffset = new Property({
      type: Vector2,
      value: [0, 0],
      isEditable: true,
      group: 'shadow',
      label: 'offset',
      order: 3,
      isKeyframable: true,
    })
  }

  get fillColor() { return this._fillColor.value }
  get fillOpacity() { return this._fillOpacity.value }
  get strokeColor() { return this._strokeColor.value }
  get strokeOpacity() { return this._strokeOpacity.value }
  get strokeWidth() { return this._strokeWidth.value }
  get strokeJoin() { return this._strokeJoin.value }
  get strokeFlow() { return this._strokeFlow.value }
  get shadowColor() { return this._shadowColor.value }
  get shadowOpacity() { return this._shadowOpacity.value }
  get shadowBlur() { return this._shadowBlur.value }
  get shadowOffset() { return this._shadowOffset.value }

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

  prepareFill() {
    this.ctx.fillStyle = this.fillColor.toStringExternalAlpha(this.fillOpacity / 100)
  }

  drawFill() {
    this.prepareFill()
    this.ctx.fill()
  }

  prepareStroke() {
    this.ctx.strokeStyle = this.strokeColor.toStringExternalAlpha(this.strokeOpacity / 100)
    this.ctx.lineWidth = this.strokeWidth
    this.ctx.lineJoin = this.strokeJoin.selected
  }

  drawStroke() {
    this.prepareStroke()
    if (this.strokeOpacity === 0 || this.strokeWidth === 0) return
    this.ctx.stroke()
  }

  prepareShadow() {
    // Apparently the DOM Renderer doesn't scale the offset params by the existing ctx transform
    // so we do it ourselves
    const currentTransform = this.ctx.getTransform()
    this.ctx.shadowColor = this.shadowColor.toStringExternalAlpha(this.shadowOpacity / 100)
    this.ctx.shadowBlur = this.shadowBlur
    // TODO: This gets rotation wrong, we should likely take the transform and apply the offset as a
    //       translation, then get the output translation and apply it as the offsetx&y
    this.ctx.shadowOffsetX = this.shadowOffset.x * currentTransform.a
    this.ctx.shadowOffsetY = this.shadowOffset.y * currentTransform.d
  }
}

export default VisibleShape
