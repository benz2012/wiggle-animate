import { observeListOfProperties } from '../../utility/state'

class Selection {
  static get className() { return 'Selection' }

  constructor(...values) {
    this.values = values
    this.selected = values[0]

    observeListOfProperties(this, ['values', 'selected'])
  }

  toString() {
    return `Selection(${this.selected} of ${JSON.stringify(this.values)})`
  }
}

export default Selection
