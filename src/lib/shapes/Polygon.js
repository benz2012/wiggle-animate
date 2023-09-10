import { makeObservable, computed } from 'mobx'

import Shape from '../drawing/Shape'
import Property from '../structure/Property'

class Polygon extends Shape {
  constructor(...args) {
    super('polygon', ...args)

    this._sides = new Property({
      type: Property.PRIMITIVES.INTEGER,
      value: 3,
      isEditable: true,
      maxValue: 100,
      order: 1,
    })

    this._height.isEditable = false
    this._width.label = 'diameter'
    this._width.group = null
    this._width.order = 2

    makeObservable(this, { radius: computed })

    // TODO: Bounding box is a bit big for 3-sides & 5-sides, however the origin is
    //       elegantly right in the gravitational center of the shape
    //       not sure what I want to do, however a dynamic box would enable corner alignment
    //       for a triangle which would be nice
  }

  get height() { return this.width }
  get sides() { return this._sides.value }
  get radius() { return this.width / 2 }

  /*
    TODO: add a custom findRectIntersections() implementation that checks
    against a polygon path, instead of the existing hover/controller rectSpec
    this will only partially be resolved by changing the rectSpec implementation, as will still be
    a rectangle Spec, the there are gaps between a polygon and it's rect bounds (most notable on 3 & 5 sides)
  */

  drawShape() {
    // Adjust for rectangular/shape alignment
    const [rectX, rectY, rectW, rectH] = this.rectSpec
    this.ctx.translate(rectX + rectW / 2, rectY + rectH / 2)

    this.ctx.beginPath()

    const anglePerSegment = (Math.PI * 2) / this.sides
    this.ctx.moveTo(0, this.radius * -1)
    Array.from(Array(this.sides)).forEach((_, index) => {
      if (index === 0) return
      this.ctx.rotate(anglePerSegment)
      this.ctx.lineTo(0, this.radius * -1)
    })
    this.ctx.rotate(anglePerSegment)
    this.ctx.closePath()

    this.shadow.prepare(this.ctx)
    this.stroke.draw(this.ctx)
    this.fill.draw(this.ctx)
  }
}

export default Polygon
