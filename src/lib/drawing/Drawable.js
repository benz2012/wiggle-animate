import { observable } from 'mobx'

import Animatable from './Animatable'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import { observeListOfProperties } from '../../utility/state'
import { isObject } from '../../utility/object'
import { identityMatrix } from '../../utility/matrix'

class Drawable extends Animatable {
  /* eslint-disable class-methods-use-this */
  static _ctx

  constructor(x, y) {
    super()
    this._position = new Vector2(x, y)
    this._origin = new Vector2()
    this._rotation = new Angle()
    this._scale = new Vector2(1, 1)

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, '_position', '_origin', '_rotation', '_scale']
    this._nestedObservables = [...super.nestedObservables, '_position', '_origin', '_rotation', '_scale']
    observeListOfProperties(this, this.observables, inheritedObservables)

    this.keyframes = {
      ...this.keyframes,
      position: observable([]),
      origin: observable([]),
      rotation: observable([]),
      scale: observable([]),
    }
  }

  get ctx() { return Drawable._ctx }
  set ctx(value) { Drawable._ctx = value }

  get x() { return this._position.x }
  set x(value) { this._position.x = value }
  get y() { return this._position.y }
  set y(value) { this._position.y = value }

  get position() { return this._position }
  set position(value) {
    if (Array.isArray(value) && value.length === 2) {
      this._position.x = value[0]
      this._position.y = value[1]
    } else if (isObject(value) && 'x' in value && 'y' in value) {
      this._position.x = value.x
      this._position.y = value.y
    } else if (value instanceof Vector2) {
      this._position = value
    }
  }

  get origin() { return this._origin }
  set origin(value) {
    let nextOriginVector
    if (Array.isArray(value) && value.length === 2) {
      nextOriginVector = new Vector2(...value)
    } else if (isObject(value) && 'x' in value && 'y' in value) {
      nextOriginVector = new Vector2(value.x, value.y)
    } else if (value instanceof Vector2) {
      nextOriginVector = value
    }
    if (!nextOriginVector) return

    const changeInOrigin = Vector2.subtract(this.origin, nextOriginVector)

    const positionalInverse = identityMatrix()
      .translateSelf(...changeInOrigin.values)
      .rotateSelf(this.rotation.degrees)
      .scaleSelf(this.scale.x, this.scale.y)
      .translateSelf(-1 * changeInOrigin.x, -1 * changeInOrigin.y)
    const toTranslate = new Vector2(positionalInverse.e, positionalInverse.f)

    this._origin = nextOriginVector
    this.position.add(toTranslate)
  }

  get rotation() { return this._rotation }
  set rotation(value) {
    if (Number.isFinite(value)) {
      this._rotation.degrees = value
    } else if (value instanceof Angle) {
      this._rotation = value
    }
  }

  get scale() { return this._scale }
  set scale(value) {
    if (Array.isArray(value) && value.length === 2) {
      this._scale.x = value[0]
      this._scale.y = value[1]
    } else if (isObject(value) && 'x' in value && 'y' in value) {
      this._scale.x = value.x
      this._scale.y = value.y
    } else if (value instanceof Vector2) {
      this._scale = value
    }
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

  updatePropertiesForFrame(frame) {
    this.position = this.valueForFrame(frame, 'position')
    this.origin = this.valueForFrame(frame, 'origin')
    this.rotation = this.valueForFrame(frame, 'rotation')
    this.scale = this.valueForFrame(frame, 'scale')
  }

  draw(parentTransform) {
    this.parentTransform = parentTransform
    this.ctx.setTransform(this.currentTransform)
  }
}

export default Drawable
