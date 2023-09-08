import { observeListOfProperties } from '../../utility/state'

class Alignment {
  static get CENTER() { return 'center' }
  static get LEFT() { return 'left' }
  static get RIGHT() { return 'right' }
  static get TOP() { return 'top' }
  static get BOTTOM() { return 'bottom' }

  constructor(x = Alignment.CENTER, y = Alignment.CENTER) {
    this.x = x
    this.y = y

    observeListOfProperties(this, ['x', 'y'])
  }

  get values() { return [this.x, this.y] }

  toString() {
    return `${this.constructor.name}(${this.x}, ${this.y})`
  }
}

export default Alignment
