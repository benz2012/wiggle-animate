const drawStageDots = (ctx, rootWidth, rootHeight, canvasPosition, canvasScale) => {
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

  ctx.fillStyle = 'rgb(42, 45, 48)'
  ctx.fill()
}

// TODO [3]: drawing the checkerboard seriously slows things down, maybe use an image instead
const checkerboardRects = (ctx, canvasSize, checkerSize) => {
  const numColumns = Math.ceil(canvasSize.width / checkerSize)
  const numRows = Math.ceil(canvasSize.height / checkerSize)
  const remainderCol = Math.round(canvasSize.width % checkerSize)
  const remainderRow = Math.round(canvasSize.height % checkerSize)

  for (let column = 0; column < numColumns; column += 1) {
    for (let row = 0; row < numRows; row += 1) {
      let checkerWidth = checkerSize
      if (column === numColumns - 1 && remainderCol) {
        checkerWidth = remainderCol
      }
      let checkerHeight = checkerSize
      if (row === numRows - 1 && remainderRow) {
        checkerHeight = remainderRow
      }

      if ((row % 2 === 0 && column % 2 === 1) || (row % 2 === 1 && column % 2 === 0)) {
        ctx.rect(
          column * checkerSize,
          row * checkerSize,
          checkerWidth,
          checkerHeight,
        )
      }
    }
  }
}

export {
  drawStageDots,
  checkerboardRects,
}
