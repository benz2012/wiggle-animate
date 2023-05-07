import ControllerBox from './ControllerBox'
import Shape from '../drawing/Shape'

class Rectangle extends Shape {
  // TODO: add corner radius property
  // this will get complicated with stroke. maybe rounded rect as separarate object?

  constructor(...args) {
    super('rectangle', ...args)
  }

  get rectSpec() {
    return [this.width / -2, this.height / -2, this.width, this.height]
  }

  draw(parentTransform, isHovered, isSelected) {
    super.draw(parentTransform)

    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)

    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
    this.stroke.draw(this.ctx)

    super.drawHoveredRect(this.rectSpec, isHovered, isSelected)

    if (isSelected) {
      ControllerBox.draw(this, this.rectSpec)
    }
  }
}

export default Rectangle
