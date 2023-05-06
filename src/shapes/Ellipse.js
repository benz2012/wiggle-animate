import ControllerBox from './ControllerBox'
import Shape from '../drawing/Shape'

class Ellipse extends Shape {
  constructor(...args) {
    super('ellipse', ...args)
  }

  draw(parentTransform, isHovered, isSelected) {
    super.draw(parentTransform)

    this.ctx.beginPath()
    this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2)

    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
    this.stroke.draw(this.ctx)

    const rectSpec = [this.width / -2, this.height / -2, this.width, this.height]
    super.drawHoveredRect(rectSpec, isHovered, isSelected)

    if (isSelected) {
      ControllerBox.draw(this, rectSpec)
    }
  }
}

export default Ellipse
