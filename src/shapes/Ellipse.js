import Shape from '../drawing/Shape'

class Ellipse extends Shape {
  constructor(...args) {
    super('ellipse', ...args)
  }

  drawShape() {
    this.ctx.beginPath()
    this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2)

    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
    this.stroke.draw(this.ctx)
  }
}

export default Ellipse
