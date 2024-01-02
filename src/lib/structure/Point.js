import Vector2 from './Vector2'
import { observeListOfProperties } from '../../utility/state'

class Point extends Vector2 {
  static get className() { return 'Point' }

  constructor(x = 0, y = 0) {
    super(x, y)
    this.controlOut = new Vector2(x, y)
    this.controlIn = new Vector2(x, y)

  get controlPoints() {
    return [this.controlOut, this.controlIn]
  }

  toString() {
    return `Point(${super.toString()}, ${this.controlIn}, ${this.controlOut})`
  }
}

export default Point
