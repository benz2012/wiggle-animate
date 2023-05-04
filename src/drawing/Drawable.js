import Item from '../structure/Item'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import { observeListOfProperties } from '../utility/state'
import { isObject } from '../utility/object'

class Drawable extends Item {
  /* eslint-disable class-methods-use-this */
  static _ctx

  constructor() {
    super()
    this.origin = new Vector2()
    this._position = new Vector2()
    this.scale = new Vector2(1, 1)
    this.rotation = new Angle()

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'origin', '_position', 'scale', 'rotation']
    this._nestedObservables = [...super.nestedObservables, 'origin', '_position', 'scale', 'rotation']
    observeListOfProperties(this, this.observables, inheritedObservables)
  }

  get ctx() { return Drawable._ctx }
  set ctx(value) { Drawable._ctx = value }

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

  draw() {
    return this
  }

  checkPointerIntersections() {
    return false
  }
}

export default Drawable
