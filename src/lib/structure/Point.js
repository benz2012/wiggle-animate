import Vector2 from './Vector2'
import { observeListOfProperties } from '../../utility/state'

class Point extends Vector2 {
  constructor(x = 0, y = 0) {
    super(x, y)
    this.controlOut = new Vector2()
    this.controlIn = new Vector2()

    observeListOfProperties(this, ['controlOut', 'controlIn'])
  }

  toString() {
    return `Point(${super.toString()}, ${this.controlIn}, ${this.controlOut})`
  }
}

export default Point
