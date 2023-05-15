import Colorable from './Colorable'

class Fill extends Colorable {
  prepare(ctx) {
    ctx.fillStyle = this.color.toString()
  }

  draw(ctx) {
    // TODO: gradients
    this.prepare(ctx)
    if (this.color === 'transparent') return
    ctx.fill()
  }
}

export default Fill
