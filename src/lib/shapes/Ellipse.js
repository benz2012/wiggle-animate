import Shape from '../drawing/Shape'

class Ellipse extends Shape {
  constructor(...args) {
    super('ellipse', ...args)
  }

  drawShape() {
    const [rectX, rectY, rectW, rectH] = this.rectSpec
    this.ctx.beginPath()
    this.ctx.ellipse(
      rectX + rectW / 2,
      rectY + rectH / 2,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    )

    this.shadow.prepare(this.ctx)
    this.stroke.draw(this.ctx)
    this.fill.draw(this.ctx)
  }
}

export default Ellipse
