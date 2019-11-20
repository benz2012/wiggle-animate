import { observable } from 'mobx'

class Handle {
  // Relative Values (0-1)
  static get INFLUENCE() { return 0.5 }
  static get DISTANCE() { return 0 }

  constructor(type) {
    this.type = type
  }

  @observable _influence = Handle.INFLUENCE
  @observable _distance = Handle.DISTANCE

  get influence() { return this._influence }
  get distance() { return this._distance }
  get position() {
    let x = this.influence
    let y = this.distance
    if (this.type === 'IN') {
      x = 1 - this.influence
      y = 1 - this.distance
    }
    return { x, y }
  }

  set influence(value) {
    this._influence = value
  }

  set distance(value) {
    this._distance = value
  }

  set position({ x, y }) {
    if (this.type === 'IN') {
      this.influence = 1 - x
      this.distance = 1 - y
    } else {
      this.influence = x
      this.distance = y
    }
  }
}

export default Handle
