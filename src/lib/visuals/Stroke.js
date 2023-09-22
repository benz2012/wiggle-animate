import Colorable from './Colorable'
import { observeListOfProperties } from '../../utility/state'
import { truncateFloatLeaveInt } from '../../utility/numbers'

class Stroke extends Colorable {
  static get className() { return 'Stroke' }

  constructor(color = 'transparent', width = 0, join = 'miter') {
    super(color)
    this.width = truncateFloatLeaveInt(width)
    this.join = join
    this.flow = 'outside' // one of: inside | outside | middle

    observeListOfProperties(this, ['_color', 'width', 'join'])
  }

  prepare(ctx) {
    ctx.strokeStyle = this.color.toString()
    ctx.lineWidth = this.width
    ctx.lineJoin = this.join
  }

  draw(ctx) {
    this.prepare(ctx)
    if (this.color.opacity === 0 || this.width === 0) return
    ctx.stroke()
  }
}

export default Stroke
