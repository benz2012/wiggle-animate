import VisibleShape from '../drawing/VisibleShape'
import Alignment from '../structure/Alignment'

class Line extends VisibleShape {
  static get className() { return 'Line' }

  constructor(x = 0, y = 0, length = 400, thickness = 10) {
    super(x, y, length, thickness)

    // Adjust Inherited Properties
    this._width.label = 'length'
    this._height.label = 'thickness'
    this.alignment.x = Alignment.LEFT
    // dissalow stroke on line, as conceptually it ~is~ a stroke in and of itself
    this.removeStrokeProperties()
    this._fillColor.group = 'stroke'
    this._fillOpacity.group = 'stroke'

    this.controllerType = 'Line'
  }

  drawPath() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)
  }
}

export default Line
