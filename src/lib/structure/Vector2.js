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

  static multiply(vectorA, vectorB) {
    const xScaled = truncateFloatLeaveInt(vectorA.x * vectorB.x)
    const yScaled = truncateFloatLeaveInt(vectorA.y * vectorB.y)
    return new Vector2(xScaled, yScaled)
  }

  static angleBetween(vectorA, vectorB) {
    const dotProduct = (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y)
    const magnitudeA = Math.sqrt(vectorA.x ** 2 + vectorA.y ** 2)
    const magnitudeB = Math.sqrt(vectorB.x ** 2 + vectorB.y ** 2)
    const cosineTheta = dotProduct / (magnitudeA * magnitudeB)
    return Math.acos(cosineTheta)
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
    this.x = truncateFloatLeaveInt(x2)
    this.y = truncateFloatLeaveInt(y2)
    return this
  }

  scale(factorX, factorY) {
    const [newX, newY] = Vector2.multiply(this, new Vector2(factorX, factorY)).values
    this.x = newX
    this.y = newY
    return this
  }

  toString() {
    return `${Vector2.className}(${this.x}, ${this.y})`
  }

  toPureObject() {
    return { className: Vector2.className, x: this.x, y: this.y }
  }

  static fromPureObject({ x, y }) {
    return new Vector2(x, y)
  }
}

// TODO [-]: remove this after debugging
window.Vector2 = Vector2

export default Vector2
