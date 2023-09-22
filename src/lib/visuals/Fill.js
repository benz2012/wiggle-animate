import Colorable from './Colorable'

class Fill extends Colorable {
  static get className() { return 'Fill' }

  prepare(ctx) {
    ctx.fillStyle = this.color.toString()
  }

  draw(ctx) {
    this.prepare(ctx)
    if (this.color === 'transparent') return
    ctx.fill()
  }

  toString() {
    return `Fill(${this.color})`
  }
}

export default Fill
