import { observable } from 'mobx'

import AnimatableItem from '../AnimatableItem'

class Rectangle extends AnimatableItem {
  // Canvas Size Relative Values (0-100)
  static get WIDTH() { return 10 }
  static get HEIGHT() { return 10 }
  static get RADIUS() { return 0 }

  @observable _width = Rectangle.WIDTH
  @observable _height = Rectangle.HEIGHT
  @observable _radius = Rectangle.RADIUS

  toJSON() {
    return ({
      ...super.toJSON(),
      width: this.width,
      height: this.height,
      radius: this.radius,
    })
  }

  get width() { return this._width }
  get height() { return this._height }
  get radius() { return this._radius }

  set width(value) {
    // TODO: update this value using item.bounds and scale
    this._width = value
    this.recreate()
  }

  set height(value) {
    // TODO: update this value using item.bounds and scale
    this._height = value
    this.recreate()
  }

  set radius(value) {
    // TODO: update this value using item.bounds and scale
    this._radius = value
    this.recreate()
  }

  onCreate(itemProps) {
    const { x, y } = this.position
    const absX = this.absolute(x)
    const absY = this.absolute(y, 'height')
    const absWidth = this.absolute(this.width)
    const absHeight = this.absolute(this.height)

    new this.paper.Path.Rectangle({
      ...itemProps,
      point: [absX - (absWidth / 2), absY - (absHeight / 2)],
      size: [absWidth, absHeight],
      radius: (this.radius / 100) * (Math.max(absWidth, absHeight) / 2),
    })
  }
}

export default Rectangle
