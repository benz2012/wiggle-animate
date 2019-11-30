import { observable } from 'mobx'

class Handle {
  static get MAX() { return 100 }
  static get STEP() { return 10 }
  static get OBSERVABLES() {
    return ['influence', 'distance']
  }

  @observable _influence
  @observable _distance

  constructor(type) {
    this.type = type
    this.influence = 50
    this.distance = 0
  }

  toJSON() {
    return ({
      type: this.type,
      influence: this.influence,
      distance: this.distance,
    })
  }

  get influence() { return this._influence }
  get distance() { return this._distance }
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

  set influence(value) {
    this._influence = value
  }

  set distance(value) {
    this._distance = value
  }

  set position({ x, y }) {
    const newX = x * Handle.MAX
    const newY = x * Handle.MAX
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
