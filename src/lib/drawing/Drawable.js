import Animatable from './Animatable'
import Property from '../structure/Property'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import { isObject } from '../../utility/object'
import { identityMatrix } from '../../utility/matrix'

class Drawable extends Animatable {
  /* eslint-disable class-methods-use-this */
  static get className() { return 'Drawable' }
  static _ctx

  constructor(x, y) {
    super()
    this._position = new Property({
      type: Vector2,
      value: [x, y],
      isEditable: true,
      group: 'transform',
      order: 1,
      isKeyframable: true,
    })
    this._origin = new Property({
      type: Vector2,
      isEditable: true,
      group: 'transform',
      order: 1,
      isKeyframable: true,
    })
    this._rotation = new Property({
      type: Angle,
      isEditable: true,
      group: 'transform',
      order: 1,
      isKeyframable: true,
    })
    this._scale = new Property({
      type: Vector2,
      value: [1, 1],
      isEditable: true,
      minValue: 0,
      group: 'transform',
      order: 1,
      valueDragRatio: 100,
      isKeyframable: true,
    })
  }

  get position() { return this._position.value }
  get origin() { return this._origin.value }
  get rotation() { return this._rotation.value }
  get scale() { return this._scale.value }

  get ctx() { return Drawable._ctx }
  set ctx(value) { Drawable._ctx = value }

  get x() { return this.position.x }
  get y() { return this.position.y }

  setOrigin(newValue, when = 1) {
    if (!newValue || !(newValue instanceof Vector2)) return

    const changeInOrigin = Vector2.subtract(this.origin, newValue)
    const positionalInverse = identityMatrix()
      .translateSelf(...changeInOrigin.values)
      .rotateSelf(this.rotation.degrees)
      .scaleSelf(this.scale.x, this.scale.y)
      .translateSelf(-1 * changeInOrigin.x, -1 * changeInOrigin.y)
    const toTranslate = new Vector2(positionalInverse.e, positionalInverse.f)

    this._origin.setValue(newValue, when)
    this._position.setValue(Vector2.add(this.position, toTranslate), when)
  }

  get currentTranslation() {
    return new DOMMatrix(this.parentTransform)
      .translateSelf(this.x, this.y)
      .translateSelf(this.origin.x, this.origin.y)
  }

  get currentTranslationRotation() {
    return this.currentTranslation
      .rotateSelf(this.rotation.degrees)
  }

  get currentOriginInverseTranslation() {
    return [-1 * this.origin.x, -1 * this.origin.y]
  }

  get currentTransform() {
    return this.currentTranslationRotation
      .scaleSelf(this.scale.x, this.scale.y)
      .translateSelf(...this.currentOriginInverseTranslation)
  }

  get currentTransformWithoutScale() {
    return this.currentTranslationRotation
      .translateSelf(...this.currentOriginInverseTranslation)
  }

  draw(parentTransform) {
    this.parentTransform = parentTransform
    this.ctx.setTransform(this.currentTransform)
  }
}

export default Drawable
