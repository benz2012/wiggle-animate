import Shape from '../drawing/Shape'
import Property from '../structure/Property'
import Alignment from '../structure/Alignment'
import Size from '../structure/Size'

class Line extends Shape {
  constructor(...args) {
    super('line', ...args)

    this.alignment.x = Alignment.LEFT
    this._thickness = new Property({
      type: Property.PRIMITIVES.FLOAT,
      isEditable: true,
      isKeyframable: true,
    })
    this._length = new Property({
      type: Property.PRIMITIVES.FLOAT,
      isEditable: true,
      isKeyframable: true,
    })

    // instantiate these values outside of the Property input
    // so that it will trigger their custom setter logic
    this.thickness = 10
    this.length = 400

    // adjust inherited properties
    this.size.isEditable = false
    // this.stroke.isEditable = false // this is not yet a property

    this.controllerType = 'Line'
  }

  get length() { return this._length }
  // These are flawed setters
  // set length(value, when) {
  //   this.length.setValue(value, when)
  //   this.width = value
  // }

  get thickness() { return this._thickness }
  // set thickness(value, when) {
  //   this.thickness.setValue(value, when)
  //   this.height = value
  // }

  drawShape() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)

    // dissalow stroke on line, as conceptually it ~is~ a stroke in and of itself
    // notice that we skip drawing it, regardless if its there
    // Reminder to remove it from property editor & keyframe editor
    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
  }
}

export default Line
