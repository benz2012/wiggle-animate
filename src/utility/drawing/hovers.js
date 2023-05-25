import theme from '../../ui/theme'

const drawHoveredIndicator = (instance) => {
  /* instance: type Shape */
  const { ctx, scale, stroke, rectSpec } = instance
  const lineWidth = 4

  ctx.setTransform(instance.currentTransform)

  ctx.beginPath()
  const strokeProtrusion = stroke.width / 2
  ctx.rect(
    rectSpec[0] - strokeProtrusion - ((lineWidth / 2) / scale.x),
    rectSpec[1] - strokeProtrusion - ((lineWidth / 2) / scale.y),
    rectSpec[2] + stroke.width + (lineWidth / scale.x),
    rectSpec[3] + stroke.width + (lineWidth / scale.y),
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