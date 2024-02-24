import theme from '../../ui/theme'

const drawPlayheadHoverLine = (ctx, dpr) => {
  ctx.strokeStyle = `${theme.palette.primary_dark[50]}`
  ctx.lineWidth = dpr
  ctx.lineJoin = 'miter'
  ctx.beginPath()
  ctx.moveTo(0, -30)
  ctx.lineTo(0, 23)
  ctx.stroke()
}

const drawPlayhead = (ctx, dpr, playheadWidth, isHovered, strokeProtrusion) => {
  ctx.beginPath()
  ctx.fillStyle = `${theme.palette.primary_dark[100]}`
  ctx.strokeStyle = isHovered ? `${theme.palette.primary[100]}` : `${theme.palette.primary_dark_dark[100]}`
  ctx.lineWidth = strokeProtrusion * dpr
  ctx.lineJoin = 'miter'
  const upperWidth = playheadWidth * dpr
  const playheadLeft = 2
  ctx.moveTo(playheadLeft, 6)
  ctx.lineTo(upperWidth / 2 + playheadLeft, 20)
  ctx.lineTo(upperWidth + playheadLeft, 6)
  ctx.lineTo(upperWidth + playheadLeft, -24)
  ctx.lineTo(playheadLeft, -24)
  ctx.closePath()
  ctx.stroke()
  ctx.fill()

  ctx.beginPath()
  ctx.lineWidth = dpr
  ctx.lineJoin = 'miter'
  ctx.strokeStyle = isHovered ? `${theme.palette.primary[100]}` : `${theme.palette.primary_dark_dark[50]}`
  ctx.moveTo(playheadLeft + upperWidth / 4, 0)
  ctx.lineTo(playheadLeft + upperWidth / 4, -14)
  ctx.moveTo(playheadLeft + (upperWidth / 4) * 2, 4)
  ctx.lineTo(playheadLeft + (upperWidth / 4) * 2, -18)
  ctx.moveTo(playheadLeft + (upperWidth / 4) * 3, 0)
  ctx.lineTo(playheadLeft + (upperWidth / 4) * 3, -14)
  ctx.stroke()
}

export {
  drawPlayheadHoverLine,
  drawPlayhead,
}
