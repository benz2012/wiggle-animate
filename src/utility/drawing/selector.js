import theme from '../../ui/theme'

const drawSelector = (ctx, selector, DPR) => {
  ctx.beginPath()

  // this might be OS dependent, ~shrugs~
  const mouseGlyphOffset = DPR === 2 ? 2 : 0
  const lineWidth = 1 * DPR

  ctx.rect(
    selector.position.x - mouseGlyphOffset,
    selector.position.y,
    ...selector.rect.values,
  )

  ctx.fillStyle = theme.palette.primary[10].toString()
  ctx.fill()

  ctx.strokeStyle = theme.palette.primary[100].toString()
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'miter'
  ctx.stroke()
}

export {
  // eslint-disable-next-line
  drawSelector,
}
