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

  toString() {
    return `${Handle.className}(${this.influence}, ${this.distance})`
  }

  toPureObject() {
    return { type: this.type, influence: this.influence, distance: this.distance }
  }

  fromPureObject({ influence, distance }) {
    this.influence = influence
    this.distance = distance
  }
}

export default Handle
