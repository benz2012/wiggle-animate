import { computed, makeObservable, observable } from 'mobx'

class Handle {
  static get className() { return 'Handle' }
  static get TYPES() { return { IN: 'IN', OUT: 'OUT' } }
  static get MAX() { return 100 }
  static get STEP() { return 10 }

  constructor(type) {
    this.type = type
    this.influence = 50
    this.distance = 0

    makeObservable(this, {
      influence: observable,
      distance: observable,
      position: computed,
    })
  }

  get position() {
    let x = this.influence
    let y = this.distance
    if (this.type === Handle.TYPES.IN) {
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
    if (this.type === Handle.TYPES.IN) {
      this.influence = Handle.MAX - newX
      this.distance = Handle.MAX - newY
    } else {
      this.influence = newX
      this.distance = newY
    }
  }

  toString() {
    return `${Handle.className}(${this.influence}, ${this.distance})`
  }
}

export default Handle
