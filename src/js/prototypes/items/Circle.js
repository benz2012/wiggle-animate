import { observable } from 'mobx'
import paper from 'paper'

import AnimatableItem from '../AnimatableItem'

class Circle extends AnimatableItem {
  // Canvas Size Relative Values (0-100)
  static get RADIUS() { return 10 }

  @observable _radius = Circle.RADIUS

  toJSON() {
    return ({
      ...super.toJSON(),
      radius: this.radius,
    })
  }

  get radius() { return this._radius }
  set radius(value) {
    // TODO: update this value using item.bounds and scale
    this._radius = value
    this.recreate()
  }

  onCreate(itemProps) {
    const { x, y } = this.position
    new paper.Path.Circle({
      ...itemProps,
      center: [this.absolute(x), this.absolute(y, 'height')],
      radius: this.absolute(this.radius) / 2,
    })
  }
}

export default Circle
