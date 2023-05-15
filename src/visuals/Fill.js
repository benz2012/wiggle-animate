import Colorable from './Colorable'
import Shadow from './Shadow'

class Fill extends Colorable {
  prepare(ctx) {
    ctx.fillStyle = this.color.toString()
  }

  draw(ctx) {
    // TODO: gradients
    this.prepare(ctx)
    if (this.color === 'transparent') return
    ctx.fill()
    Shadow.clear(ctx)
  }
}

export default Fill
