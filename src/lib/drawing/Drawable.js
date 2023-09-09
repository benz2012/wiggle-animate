import Animatable from './Animatable'
import Property from '../structure/Property'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import { isObject } from '../../utility/object'
import { identityMatrix } from '../../utility/matrix'

class Drawable extends Animatable {
  /* eslint-disable class-methods-use-this */
  static _ctx

  constructor(x, y) {
    super()
    this._position = new Property({
      type: Vector2,
      value: [x, y],
      isEditable: true,
      isKeyframable: true,
    })
    this._origin = new Property({
      type: Vector2,
      isEditable: true,
      isKeyframable: true,
    })
    this._rotation = new Property({
      type: Angle,
      isEditable: true,
      isKeyframable: true,
    })
    this._scale = new Property({
      type: Vector2,
      value: [1, 1],
      isEditable: true,
      isKeyframable: true,
    })
  }

  get position() { return this._position }
  get origin() { return this._origin }
  get rotation() { return this._rotation }
  get scale() { return this._scale }

  get ctx() { return Drawable._ctx }
  set ctx(value) { Drawable._ctx = value }

  get x() { return this.position.value.x }
  get y() { return this.position.value.y }

  setOrigin(newValue, when = 1) {
    let nextOriginVector
    if (Array.isArray(newValue) && newValue.length === 2) {
      nextOriginVector = new Vector2(...newValue)
    } else if (isObject(newValue) && 'x' in newValue && 'y' in newValue) {
      nextOriginVector = new Vector2(newValue.x, newValue.y)
    } else if (newValue instanceof Vector2) {
      nextOriginVector = newValue
    }
    if (!nextOriginVector) return

    const changeInOrigin = Vector2.subtract(this.origin.value, nextOriginVector)

    const positionalInverse = identityMatrix()
      .translateSelf(...changeInOrigin.values)
      .rotateSelf(this.rotation.value.degrees)
      .scaleSelf(this.scale.value.x, this.scale.value.y)
      .translateSelf(-1 * changeInOrigin.x, -1 * changeInOrigin.y)
    const toTranslate = new Vector2(positionalInverse.e, positionalInverse.f)

    this.origin.setValue(nextOriginVector, when)
    this.position.setValue(Vector2.add(this.position.value, toTranslate), when)
  }

  get currentTranslation() {
    return new DOMMatrix(this.parentTransform)
      .translateSelf(this.x, this.y)
      .translateSelf(this.origin.value.x, this.origin.value.y)
  }

  get currentTranslationRotation() {
    return this.currentTranslation
      .rotateSelf(this.rotation.value.degrees)
  }

  get currentOriginInverseTranslation() {
    return [-1 * this.origin.value.x, -1 * this.origin.value.y]
  }

  get currentTransform() {
    return this.currentTranslationRotation
      .scaleSelf(this.scale.value.x, this.scale.value.y)
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
