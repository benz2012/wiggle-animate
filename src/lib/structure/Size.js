import { observeListOfProperties } from '../../utility/state'
import { truncateFloatLeaveInt } from '../../utility/numbers'

class Size {
  static get className() { return 'Size' }

  constructor(width = 100, height = 100) {
    this.width = truncateFloatLeaveInt(width)
    this.height = truncateFloatLeaveInt(height)

    observeListOfProperties(this, ['width', 'height'])
  }

  get values() { return [this.width, this.height] }

  get area() {
    return (
      Math.abs(this.width) * Math.abs(this.height)
    )
  }

  toString() {
    return `${this.className}(${this.width}, ${this.height})`
  }

  toPureObject() {
    return { className: Size.className, width: this.width, height: this.height }
  }
}

export default Size
