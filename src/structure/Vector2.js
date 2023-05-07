import { observeListOfProperties } from '../utility/state'

class Vector2 {
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
    this.x = x
    this.y = y

    this.observables = ['x', 'y']
    observeListOfProperties(this, this.observables)
  }

  get values() { return [this.x, this.y] }
  get object() { return { x: this.x, y: this.y } }

  add(anotherVector) {
    this.x += anotherVector.x
    this.y += anotherVector.y
  }

  subtract(anotherVector) {
    this.x -= anotherVector.x
    this.y -= anotherVector.y
  }

  distance(anotherVector) {
    return Vector2.distance(this, anotherVector)
  }

  toString() {
    return `Vector2(${this.x}, ${this.y})`
  }
}

export default Vector2
