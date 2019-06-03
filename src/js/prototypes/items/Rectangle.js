import { observable } from 'mobx'
import paper from 'paper'

import AnimatableItem from '../AnimatableItem'

class Rectangle extends AnimatableItem {
  // Canvas Size Relative Values (0-100)
  static get WIDTH() { return 10 }
  static get HEIGHT() { return 10 }
  static get RADIUS() { return 0 }

  @observable _width = Rectangle.WIDTH
  @observable _height = Rectangle.HEIGHT
  @observable _radius = Rectangle.RADIUS

  get width() { return this._width }
  get height() { return this._height }
  get radius() { return this._radius }

  set width(value) {
    this._width = value
    this.recreate()
  }

  set height(value) {
    this._height = value
    this.recreate()
  }

  set radius(value) {
    this._radius = value
    this.recreate()
  }

  create(canvas) {
    const itemProps = super.create(canvas)

    const { x, y } = this.position
    const absX = this.absolute(x)
    const absY = this.absolute(y, 'height')
    const absWidth = this.absolute(this.width)
    const absHeight = this.absolute(this.height)

    new paper.Path.Rectangle({
      ...itemProps,
      point: [absX - (absWidth / 2), absY - (absHeight / 2)],
      size: [absWidth, absHeight],
      radius: (this.radius / 100) * (Math.max(absWidth, absHeight) / 2),
    })

    this.setUntrackedValues()
  }
}

export default Rectangle
