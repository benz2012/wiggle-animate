import { observeListOfProperties } from '../utility/state'

class Size {
  constructor(width = 100, height = 100) {
    this.width = width
    this.height = height

    this.observables = ['width', 'height']
    observeListOfProperties(this, this.observables)
  }

  get values() { return [this.width, this.height] }
}

export default Size
