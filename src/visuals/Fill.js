import Colorable from './Colorable'

class Fill extends Colorable {
  draw(ctx) {
    if (this.color === 'transparent') return
    // TODO: gradients
    ctx.fillStyle = this.color.toString()
    ctx.fill()
  }
}

export default Fill
