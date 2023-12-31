import { makeAutoObservable } from 'mobx'

import Size from '../lib/structure/Size'
import Vector2 from '../lib/structure/Vector2'

// TODO [2]: some selection scenarios are still bugged

class Selector {
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
    this.rect.width = width
    this.rect.height = height
  }

  setHovers(values) { this.hovers = values }
}

export default Selector
