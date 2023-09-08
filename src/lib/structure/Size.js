import { observeListOfProperties } from '../../utility/state'

class Size {
  constructor(width = 100, height = 100) {
    this.width = width
    this.height = height

    observeListOfProperties(this, ['width', 'height'])
  }

  get values() { return [this.width, this.height] }

  get area() {
    return (
      Math.abs(this.width) * Math.abs(this.height)
    )
  }

  toString() {
    return `Size(${this.width}, ${this.height})`
  }
}

export default Size
