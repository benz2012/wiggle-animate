import theme from '../../ui/theme'
import Fill from '../../lib/visuals/Fill'
import Stroke from '../../lib/visuals/Stroke'

const drawSelector = (ctx, selector, DPR) => {
  ctx.beginPath()

  // this might be OS dependent, ~shrugs~
  const mouseGlyphOffset = DPR === 2 ? 2 : 0
  const lineWidth = 1 * DPR
  const fill = new Fill(theme.palette.primary[10])
  const stroke = new Stroke(theme.palette.primary[100], lineWidth)

  ctx.rect(
    selector.position.x - mouseGlyphOffset,
    selector.position.y,
    ...selector.rect.values,
  )
  fill.draw(ctx)
  stroke.draw(ctx)
}

export {
  // eslint-disable-next-line
  drawSelector,
}
