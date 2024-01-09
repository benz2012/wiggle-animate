import { computed, makeObservable, observable } from 'mobx'

// TODO [3]: Add a setting for the default animation style
//           curently it's set to ease-in-out, which is controversial

class Handle {
  static get className() { return 'Handle' }
  static get TYPES() { return { IN: 'IN', OUT: 'OUT' } }
  static get MAX() { return 1 }
  static get STEP() { return 10 }

  constructor(type) {
    this.type = type
    this.influence = 0.5
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

  toPureObject() {
    return { influence: this.influence, distance: this.distance }
  }
}

export default Handle
