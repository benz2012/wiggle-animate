import Item from '../structure/Item'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import { observeListOfProperties } from '../utility/state'
import { isObject } from '../utility/object'

class Drawable extends Item {
  /* eslint-disable class-methods-use-this */
  static _ctx

  constructor(x, y) {
    super()
    this.origin = new Vector2()
    this._position = new Vector2(x, y)
    this.scale = new Vector2(1, 1)
    this.rotation = new Angle()

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'origin', '_position', 'scale', 'rotation']
    this._nestedObservables = [...super.nestedObservables, 'origin', '_position', 'scale', 'rotation']
    observeListOfProperties(this, this.observables, inheritedObservables)

    this.editables = [...this.editables, ['origin', 'Vector2'], ['position', 'Vector2'], ['scale', 'Vector2'], ['rotation', 'Angle']]
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
      /* eslint-disable prefer-destructuring */
      this._position.x = value[0]
      this._position.y = value[1]
    } else if (isObject(value) && 'x' in value && 'y' in value) {
      this._position.x = value.x
      this._position.y = value.y
    } else if (value instanceof Vector2) {
      this._position = value
    }
  }

  // TODO: when setting item's origin, position should be inverted by current scale and rotation
  // eg. if an item is rotated by 180deg and you move origin by 200 pixels in y direction
  // the position of the item should move by 200 pixels in the "opposite" direction,
  // which is only "opposite" because of how 180deg opperates. It's where the item would be
  // before rotation if the origin was moved from that point in time

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
