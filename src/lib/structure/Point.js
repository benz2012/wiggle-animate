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

  movePointBy(relativeX, relativeY) {
    // const toMoveOffset = Vector2.subtract(this, new Vector2(newX, newY))
    this.x += relativeX
    this.y += relativeY
    this.controlOut.x += relativeX
    this.controlOut.y += relativeY
    this.controlIn.x += relativeX
    this.controlIn.y += relativeY
  }

  toString() {
    return `Point(${super.toString()}, ${this.controlIn}, ${this.controlOut})`
  }
}

export default Point
