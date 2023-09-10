import Colorable from './Colorable'
import Vector2 from '../structure/Vector2'
import { observeListOfProperties } from '../../utility/state'

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
    // REMINDER: truncate those floats after you've restructured this
  }

  constructor(color = 'transparent', blur = 0, offsetX = 0, offsetY = 0) {
    super(color)
    this.blur = blur
    this.offset = new Vector2(offsetX, offsetY)

    observeListOfProperties(this, ['_color', 'blur', 'offset'])
  }

  prepare(ctx) {
    // Apparently the DOM Renderer doesn't scale the offset params by the existing ctx transform
    // so we do it ourselves
    const currentTransform = ctx.getTransform()
    ctx.shadowColor = this.color
    ctx.shadowBlur = this.blur
    // TODO: This gets rotation wrong, we should likely take the transform and apply the offset as a
    //       translation, then get the output translation and apply it as the offsetx&y
    ctx.shadowOffsetX = this.offset.x * currentTransform.a
    ctx.shadowOffsetY = this.offset.y * currentTransform.d
  }
}

export default Shadow
