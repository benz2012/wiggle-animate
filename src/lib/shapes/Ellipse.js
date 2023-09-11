import VisibleShape from '../drawing/VisibleShape'

class Ellipse extends VisibleShape {
  static get className() { return 'Ellipse' }

  constructor(...args) {
    super('ellipse', ...args)
  }

  /*
    TODO: add a custom findRectIntersections() implementation that checks
    against an elipse path, instead of the existing hover/controller rectSpec
  */

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

    this.prepareShadow()
    this.drawStroke()
    this.drawFill()
  }
}

export default Ellipse
