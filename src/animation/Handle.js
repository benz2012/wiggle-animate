import { computed, makeObservable } from 'mobx'

import { observeListOfProperties } from '../utility/state'

class Handle {
  static get TYPES() { return ['IN', 'OUT'] }
  static get MAX() { return 100 }
  static get STEP() { return 10 }

  constructor(type) {
    this.type = type
    this.influence = 50
    this.distance = 0

    this.observables = ['influence', 'distance']
    observeListOfProperties(this, this.observables)
    makeObservable(this, { position: computed })
  }

  get position() {
    let x = this.influence
    let y = this.distance
    if (this.type === 'IN') {
      x = Handle.MAX - this.influence
      y = Handle.MAX - this.distance
    }
    x /= Handle.MAX
    y /= Handle.MAX
    return { x, y }
  }

  set position({ x, y }) {
    const newX = x * Handle.MAX
    const newY = y * Handle.MAX
    if (this.type === 'IN') {
      this.influence = Handle.MAX - newX
      this.distance = Handle.MAX - newY
    } else {
      this.influence = newX
      this.distance = newY
    }
  }
}

export default Handle
