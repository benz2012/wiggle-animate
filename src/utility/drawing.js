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

export {
  // eslint-disable-next-line import/prefer-default-export
  drawCenterPoint,
}
