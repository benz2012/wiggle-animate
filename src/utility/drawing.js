/* Useful for debugging position, origin, scale, rotation */
const drawCenterPoint = (ctx, origin) => {
  ctx.beginPath()
  ctx.rect(-4, -4, 8, 8)
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.beginPath()
  ctx.rect(-2, -2, 4, 4)
  ctx.fillStyle = 'black'
  ctx.fill()

  if (origin) {
    ctx.translate(...origin.values)
    drawCenterPoint(ctx)
  }
}

const ContainerControllerSizes = {
  originBox: 100,
  positionBox: 200,
  rotationCircle: 12,
}
const drawContainerController = (ctx, isPositionHovered, isOriginHovered) => {
  const { originBox, positionBox, rotationCircle } = ContainerControllerSizes

  ctx.strokeStyle = 'rgba(255, 208, 66, 1)'
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.rect(originBox / -2, originBox / -2, originBox, originBox)
  ctx.stroke()
  if (isOriginHovered) {
    ctx.fillStyle = 'rgba(255, 208, 66, 0.2)'
    ctx.fill()
  }

  ctx.beginPath()
  ctx.rect(positionBox / -2, positionBox / -2, positionBox, positionBox)
  ctx.stroke()
  if (isPositionHovered) {
    ctx.beginPath()
    ctx.rect(positionBox / -2, positionBox / -2, positionBox, positionBox)
    ctx.rect(originBox / -2, originBox / -2, originBox, originBox)
    ctx.fillStyle = 'rgba(255, 208, 66, 0.2)'
    ctx.fill('evenodd')
  }

  ctx.beginPath()
  ctx.moveTo(0, -originBox)
  ctx.lineTo(0, -originBox - 75)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(0, -originBox - 75 - rotationCircle, rotationCircle, rotationCircle, Math.PI * 2, 0, Math.PI * 2)
  ctx.stroke()
}

const drawPlayheadHoverLine = (ctx) => {
  ctx.strokeStyle = 'rgba(25, 117, 210, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -30)
  ctx.lineTo(0, 23)
  ctx.stroke()
}

const drawPlayhead = (ctx, playheadWidth, isHovered) => {
  ctx.beginPath()
  ctx.fillStyle = 'rgba(25, 117, 210, 1)'
  ctx.strokeStyle = isHovered ? 'rgba(45, 147, 255, 1)' : 'rgba(13, 71, 161, 1)'
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
  ctx.strokeStyle = isHovered ? 'rgba(215, 235, 255, 0.4)' : 'rgba(13, 71, 161, 0.5)'
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
  ContainerControllerSizes,
  drawContainerController,
  drawPlayheadHoverLine,
  drawPlayhead,
}
