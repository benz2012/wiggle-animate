import { makeAutoObservable } from 'mobx'

import Size from '../lib/structure/Size'
import Vector2 from '../lib/structure/Vector2'

class Selector {
  static get NON_ZERO_MAGNITUDE() { return 0.001 }

  constructor() {
    this.rect = new Size(0, 0)
    this.position = new Vector2(0, 0)
    this.hovers = []

    makeAutoObservable(this)
  }

  setPosition(vector) {
    this.position.x = vector.x
    this.position.y = vector.y
  }

  setRect(width, height) {
    // It is possible to drag the mouse in only 1-dimension (surprising) and that
    // creates an invisible selector box until the other dimension gains magnitude.
    // So to eliminate that, we force any 1-dimensional rect two have a 2nd dimension
    // This still allows the 0-dimensional rect case

    let safeWidth = width
    let safeHeight = height
    if (width === 0 && height !== 0) {
      safeWidth = Selector.NON_ZERO_MAGNITUDE
    } else if (height === 0 && width !== 0) {
      safeHeight = Selector.NON_ZERO_MAGNITUDE
    }

    this.rect.width = safeWidth
    this.rect.height = safeHeight
  }

  setHovers(values) { this.hovers = values }
}

export default Selector
