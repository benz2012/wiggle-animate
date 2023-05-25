import theme from '../../ui/theme'

const drawPotentialPathPoint = (ctx, brightCanvas = false) => {
  // These are highly specific to this component, no need to theme them
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  if (brightCanvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
  }

  // Dull Point "Stroke"
  ctx.beginPath()
  ctx.ellipse(0, 0, 9, 9, 0, 0, Math.PI * 2)
  ctx.ellipse(0, 0, 6, 6, 0, 0, Math.PI * 2)
  ctx.fill('evenodd')

  // Cross FG
  ctx.beginPath()
  ctx.rect(-18, -25, 2, 16)
  ctx.rect(-25, -18, 16, 2)
  ctx.fill()
}

const drawPathPoint = (ctx, isHovered) => {
  // Hovered "Stroke"
  if (isHovered) {
    ctx.beginPath()
    ctx.ellipse(0, 0, 11, 11, 0, 0, Math.PI * 2)
    ctx.ellipse(0, 0, 9, 9, 0, 0, Math.PI * 2)
    ctx.fillStyle = `${theme.palette.secondary[100]}`
    ctx.fill('evenodd')
  }

  // Point "Stroke"
  ctx.beginPath()
  ctx.ellipse(0, 0, 9, 9, 0, 0, Math.PI * 2)
  ctx.ellipse(0, 0, 6, 6, 0, 0, Math.PI * 2)
  ctx.fillStyle = `${theme.palette.tertiary[100]}`
  ctx.fill('evenodd')

  // Dull Point Center
  if (isHovered) {
    ctx.beginPath()
    ctx.ellipse(0, 0, 6, 6, 0, 0, Math.PI * 2)
    ctx.fillStyle = theme.palette.WHITE
    ctx.fillStyle = `${theme.palette.tertiary[50]}`
    ctx.fill()
  }
}

export {
  drawPotentialPathPoint,
  drawPathPoint,
}
