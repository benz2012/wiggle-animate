import Fill from '../../lib/visuals/Fill'

const drawStageDots = (ctx, rootWidth, rootHeight, canvasPosition, canvasScale) => {
  const dotFill = new Fill('rgb(42, 45, 48)')
  const dotWidth = 4
  const dotSpacing = 48
  const segmentLength = (dotSpacing + dotWidth)
  const directions = [1, -1]

  const xSpaceToWorkWith = (
    (rootWidth / 2) - (dotSpacing / 2) + (Math.abs(canvasPosition.x) / canvasScale)
  ) / canvasScale
  const numDotsX = Math.ceil(xSpaceToWorkWith / segmentLength)
  const numDotsY = Math.ceil(
    Math.ceil(((
      (rootHeight + (Math.abs(canvasPosition.y) * 2) / canvasScale) / segmentLength
    ) / canvasScale) / 2) * 2
  )

  ctx.beginPath()
  directions.forEach((direction) => {
    Array.from(Array(numDotsX)).forEach((_, xIndex) => {
      Array.from(Array(numDotsY)).forEach((__, yIndex) => {
        const actualYIndex = ((numDotsY / -2) + yIndex)
        ctx.rect(
          direction * xIndex * segmentLength + (direction * (segmentLength / 2)),
          actualYIndex * segmentLength,
          dotWidth,
          dotWidth,
        )
      })
    })
  })

  dotFill.draw(ctx)
}

export {
  // eslint-disable-next-line
  drawStageDots,
}
