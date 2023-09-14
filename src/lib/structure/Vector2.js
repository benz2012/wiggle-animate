import { observeListOfProperties } from '../../utility/state'
import { truncateFloatLeaveInt } from '../../utility/numbers'

class Vector2 {
  static get className() { return 'Vector2' }

  static add(vectorA, vectorB) {
    return new Vector2(
      vectorA.x + vectorB.x,
      vectorA.y + vectorB.y
    )
  }

  static subtract(vectorA, vectorB) {
    return new Vector2(
      vectorA.x - vectorB.x,
      vectorA.y - vectorB.y
    )
  }

  static distance(vectorA, vectorB) {
    const xDistanceSquared = (vectorA.x - vectorB.x) ** 2
    const yDistanceSquared = (vectorA.y - vectorB.y) ** 2
    return Math.sqrt(xDistanceSquared + yDistanceSquared)
  }

  constructor(x = 0, y = 0) {
    this.x = truncateFloatLeaveInt(x)
    this.y = truncateFloatLeaveInt(y)

    observeListOfProperties(this, ['x', 'y'])
  }

  get values() { return [this.x, this.y] }
  get object() { return { x: this.x, y: this.y } }

  add(anotherVector) {
    this.x += anotherVector.x
    this.y += anotherVector.y
    return this
  }

  subtract(anotherVector) {
    this.x -= anotherVector.x
    this.y -= anotherVector.y
    return this
  }

  distance(anotherVector) {
    return Vector2.distance(this, anotherVector)
  }

  rotate(angle) {
    // Takes angle as Radians
    const sineOfAngle = Math.sin(angle)
    const cosineOfAngle = Math.cos(angle)
    const x2 = this.x * cosineOfAngle - this.y * sineOfAngle
    const y2 = this.x * sineOfAngle + this.y * cosineOfAngle
    this.x = x2
    this.y = y2
    return this
  }

  scale(factorX, factorY) {
    const x2 = this.x * factorX
    const y2 = this.y * factorY
    this.x = x2
    this.y = y2
    return this
  }

  toString() {
    return `Vector2(${this.x}, ${this.y})`
  }
}

// TODO: remove this after debugging
window.Vector2 = Vector2

export default Vector2
