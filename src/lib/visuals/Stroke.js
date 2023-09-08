import Colorable from './Colorable'
import { observeListOfProperties } from '../../utility/state'

class Stroke extends Colorable {
  constructor(color = 'transparent', width = 0, join = 'miter') {
    super(color)
    this.width = width
    this.join = join
    // TODO: make this observable
    // TODO: tweak the drawing stack so that these 3 options are possible
    //       this could get complicted depending on shape, we'll see
    //       might need to draw/cut 1 less pixel otherwise there could be a subpixel/gpu gap line
    //       - middle = default
    //       - inside = draw width*2, cut mask around shape
    //       - outside = draw width*2, cut subtraction within shape
    this.flow = 'outside' // one of: inside | outside | middle

    observeListOfProperties(this, ['_color', 'width', 'join'])
  }

  prepare(ctx) {
    ctx.strokeStyle = this.color.toString()
    ctx.lineWidth = this.width
    ctx.lineJoin = this.join
  }

  draw(ctx) {
    // TODO: gradients
    this.prepare(ctx)
    if (this.color.opacity === 0 || this.width === 0) return
    ctx.stroke()
  }
}

export default Stroke
