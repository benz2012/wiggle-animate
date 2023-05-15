import Colorable from './Colorable'
import Vector2 from '../structure/Vector2'
import { observeListOfProperties } from '../utility/state'

class Shadow extends Colorable {
  static clear(ctx) {
    // This class needs a clear() where Fill and Stroke do not because
    // each of those methods have a drawing operation where you would be
    // declarativley aware of the properties of the Fill/Stroke at that time
    // Shadow on the other hand does not have a draw operation. It gets
    // drawn during the fill stage, but you don't want to always check the
    // shadow when you just have a fill to draw.
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

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
