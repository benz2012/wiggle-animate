import VisibleShape from '../drawing/VisibleShape'

class Rectangle extends VisibleShape {
  static get className() { return 'Rectangle' }
  // TODO [4]: add corner radius property
  // this will get complicated with stroke. maybe rounded rect as separarate object?

  constructor(...args) {
    super('rectangle', ...args)
  }

  drawShape() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)

    this.prepareShadow()
    this.drawStroke()
    this.drawFill()
  }
}

export default Rectangle
