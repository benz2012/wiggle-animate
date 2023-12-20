import VisibleShape from '../drawing/VisibleShape'

class Rectangle extends VisibleShape {
  static get className() { return 'Rectangle' }
  // TODO [4]: add corner radius property
  // this will get complicated with stroke. maybe rounded rect as separarate object?

  constructor(...args) {
    super('rectangle', ...args)
  }

  drawPath() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)
  }
}

export default Rectangle
