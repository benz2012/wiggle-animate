import { observable } from 'mobx'
import paper from 'paper'

import AnimatableItem from '../AnimatableItem'

class Circle extends AnimatableItem {
  // Canvas Size Relative Values (0-100)
  static get RADIUS() { return 10 }

  @observable _radius = Circle.RADIUS

  get radius() { return this._radius }
  set radius(value) {
    this._radius = value
    this.recreate()
  }

  create(canvas) {
    const itemProps = super.create(canvas)

    const { x, y } = this.position
    new paper.Path.Circle({
      ...itemProps,
      center: [this.absolute(x), this.absolute(y, 'height')],
      radius: this.absolute(this.radius) / 2,
    })

    this.setUntrackedValues()
  }
}

export default Circle
