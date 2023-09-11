import theme from '../../ui/theme'

const drawHoveredIndicator = (instance) => {
  /* instance: type Shape */
  const { ctx, scale, strokeWidth, rectSpec } = instance
  const lineWidth = 4

  ctx.setTransform(instance.currentTransform)

  ctx.beginPath()
  const strokeProtrusion = strokeWidth / 2
  ctx.rect(
    rectSpec[0] - strokeProtrusion - ((lineWidth / 2) / scale.value.x),
    rectSpec[1] - strokeProtrusion - ((lineWidth / 2) / scale.value.y),
    rectSpec[2] + strokeWidth + (lineWidth / scale.value.x),
    rectSpec[3] + strokeWidth + (lineWidth / scale.value.y),
  )
  ctx.strokeStyle = `${theme.palette.primary[75]}`
  ctx.lineWidth = lineWidth
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()
}

const drawHoveredIndicatorPath = (instance) => {
  /* instance: type Path */
  const { ctx } = instance
  ctx.setTransform(instance.currentTransform)
  ctx.beginPath()
  instance.drawThePath()
  ctx.strokeStyle = `${theme.palette.primary[75]}`
  ctx.lineWidth = 2
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()
}

export {
  drawHoveredIndicator,
  drawHoveredIndicatorPath,
}
