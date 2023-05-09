import Colorable from './Colorable'
import { observeListOfProperties } from '../utility/state'

class Stroke extends Colorable {
  constructor(color = 'transparent', width = 0, join = 'miter') {
    super(color)
    this.width = width
    this.join = join

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'width', 'join']
    observeListOfProperties(this, this.observables, inheritedObservables)
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
