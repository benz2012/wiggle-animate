import theme from '../../ui/theme'

const drawHoveredIndicator = (instance) => {
  /* instance: type Shape */
  const { ctx, scale, strokeWidth, rectSpec } = instance
  const lineWidth = 4

  ctx.setTransform(instance.currentTransform)

  ctx.beginPath()
  const strokeProtrusion = strokeWidth / 2
  ctx.rect(
    rectSpec[0] - strokeProtrusion - ((lineWidth / 2) / scale.x),
    rectSpec[1] - strokeProtrusion - ((lineWidth / 2) / scale.y),
    rectSpec[2] + strokeWidth + (lineWidth / scale.x),
    rectSpec[3] + strokeWidth + (lineWidth / scale.y),
  )
  ctx.strokeStyle = `${theme.palette.primary[75]}`
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()
}

const drawHoveredIndicatorPath = (instance) => {
  /* instance: type Path */
  const { ctx } = instance
  ctx.setTransform(instance.currentTransform)
  ctx.beginPath()
  instance.drawPath()
  ctx.strokeStyle = `${theme.palette.primary[75]}`
  ctx.lineWidth = 2
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()
}

const octantCursorMap = {
  0: 'ew-resize',
  4: 'ew-resize',

  1: 'nesw-resize',
  5: 'nesw-resize',

  2: 'ns-resize',
  6: 'ns-resize',

  3: 'nwse-resize',
  7: 'nwse-resize',
}

export {
  drawHoveredIndicator,
  drawHoveredIndicatorPath,
  octantCursorMap,
}
