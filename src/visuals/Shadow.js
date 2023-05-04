import Colorable from './Colorable'
import Vector2 from '../structure/Vector2'
import { observeListOfProperties } from '../utility/state'

class Shadow extends Colorable {
  constructor(color = 'transparent', blur = 0, offsetX = 0, offsetY = 0) {
    super(color)
    this.blur = blur
    this.offset = new Vector2(offsetX, offsetY)

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'blur', 'offset']
    this._nestedObservables = [...super.nestedObservables, 'offset']
    observeListOfProperties(this, this.observables, inheritedObservables)
  }

  prepare(ctx) {
    ctx.shadowColor = this.color
    ctx.shadowBlur = this.blur
    ctx.shadowOffsetX = this.offset.x
    ctx.shadowOffsetY = this.offset.y
  }
}

export default Shadow
