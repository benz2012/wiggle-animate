import Shape from '../drawing/Shape'
import Alignment from '../structure/Alignment'

class Line extends Shape {
  static get className() { return 'Line' }

  constructor(x = 0, y = 0, length = 400, thickness = 10) {
    super('line', x, y, length, thickness)

    // Adjust Inherited Properties
    this._width.label = 'length'
    this._height.label = 'thickness'
    this.alignment.x = Alignment.LEFT
    // this.stroke.isEditable = false // this is not yet a property
    // this.stroke.isKeyframable = false // this is not yet a property

    this.controllerType = 'Line'
  }

  drawShape() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)

    // dissalow stroke on line, as conceptually it ~is~ a stroke in and of itself
    // notice that we skip drawing it, regardless if its there
    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
  }
}

export default Line
