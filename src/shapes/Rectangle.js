import Shape from '../drawing/Shape'

class Rectangle extends Shape {
  // TODO: add corner radius property
  // this will get complicated with stroke. maybe rounded rect as separarate object?

  constructor(...args) {
    super('rectangle', ...args)
  }

  drawShape() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)

    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
    this.stroke.draw(this.ctx)
  }
}

export default Rectangle
