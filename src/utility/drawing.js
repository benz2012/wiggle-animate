/* Useful for debugging position, origin, scale, rotation */
const drawCenterPoint = (ctx, currentTransform, origin) => {
  ctx.setTransform(currentTransform)
  ctx.translate(origin.x, origin.y)
  ctx.beginPath()
  ctx.rect(-4, -4, 8, 8)
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.beginPath()
  ctx.rect(-2, -2, 4, 4)
  ctx.fillStyle = 'black'
  ctx.fill()
}

const drawPlayhead = (ctx, DPR, playheadWidth) => {
  const thinLineOffset = DPR === 1 ? 0.5 : 0
  ctx.translate(thinLineOffset, -thinLineOffset)

  ctx.beginPath()
  ctx.fillStyle = 'rgba(25, 117, 210, 1)'
  ctx.strokeStyle = 'rgba(13, 71, 161, 1)'
  ctx.lineWidth = 4
  const upperWidth = playheadWidth
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
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(13, 71, 161, 0.5)'
  ctx.moveTo(playheadLeft + upperWidth / 4, 0)
  ctx.lineTo(playheadLeft + upperWidth / 4, -14)
  ctx.moveTo(playheadLeft + (upperWidth / 4) * 2, 4)
  ctx.lineTo(playheadLeft + (upperWidth / 4) * 2, -18)
  ctx.moveTo(playheadLeft + (upperWidth / 4) * 3, 0)
  ctx.lineTo(playheadLeft + (upperWidth / 4) * 3, -14)
  ctx.stroke()
}

export {
  drawCenterPoint,
  drawPlayhead,
}
