import theme from '../../ui/theme'
import Handle from '../../lib/animation/Handle'

const drawGrid = (ctx, units, padding, innerSize) => {
  const stepSize = innerSize / Handle.STEP

  ctx.strokeStyle = `${theme.palette.action.disabled}`
  ctx.lineWidth = units(1)
  ctx.lineJoin = 'miter'

  ctx.beginPath()
  Array.from(Array(Handle.STEP + 1)).forEach((_, idx) => {
    ctx.moveTo(idx * stepSize, -padding)
    ctx.lineTo(idx * stepSize, innerSize + padding)
    ctx.moveTo(-padding, idx * stepSize)
    ctx.lineTo(innerSize + padding, idx * stepSize)
  })
  ctx.stroke()
}

const drawBezier = (ctx, units, innerSize, c1x, c1y, c2x, c2y) => {
  const rectLength = units(6)
  const rectRadius = rectLength / 2

  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  ctx.lineWidth = units(1)
  ctx.lineJoin = 'miter'

  ctx.beginPath()
  ctx.moveTo(0, innerSize)
  ctx.bezierCurveTo(...[
    innerSize * c1x, innerSize * c1y,
    innerSize * c2x, innerSize * c2y,
    innerSize, 0,
  ])
  ctx.stroke()

  ctx.fillStyle = `${theme.palette.tertiary[100]}`

  ctx.beginPath()
  ctx.fillRect(0 - rectRadius, innerSize - rectRadius, rectLength, rectLength)
  ctx.beginPath()
  ctx.fillRect(innerSize - rectRadius, 0 - rectRadius, rectLength, rectLength)
}

const drawControlHandle = (
  ctx,
  units,
  innerSize,
  whichHandle,
  x,
  y,
  setIntersection,
  pointerPosition,
  active = false,
) => {
  const strokeLineWidth = units(1)
  const handleCircleRadius = units(5)
  const scalarX = x * innerSize
  const scalarY = y * innerSize

  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  ctx.fillStyle = 'transparent'
  ctx.lineWidth = strokeLineWidth
  ctx.lineJoin = 'miter'

  // Check for Hover Intersections & cursor handling
  ctx.beginPath()
  ctx.ellipse(...[
    scalarX, scalarY,
    handleCircleRadius + strokeLineWidth, handleCircleRadius + strokeLineWidth,
    0, 0, Math.PI * 2,
  ])
  const hovered = ctx.isPointInPath(pointerPosition.x, pointerPosition.y)
  if (hovered) {
    setIntersection(whichHandle, true)
  } else {
    setIntersection(whichHandle, false)
  }
  if (active) {
    // This sets everything to white, unlike the switch below that only sets the circle white
    ctx.strokeStyle = `${theme.palette.WHITE}`
  }

  // Begin Drawing
  ctx.beginPath()
  if (whichHandle === 1) {
    ctx.moveTo(0, innerSize)
  } else if (whichHandle === 2) {
    ctx.moveTo(innerSize, 0)
  }
  ctx.lineTo(scalarX, scalarY)
  ctx.stroke()

  if (hovered || active) {
    ctx.strokeStyle = `${theme.palette.WHITE}`
  }
  ctx.beginPath()
  ctx.ellipse(...[
    scalarX, scalarY,
    handleCircleRadius, handleCircleRadius,
    0, 0, Math.PI * 2,
  ])
  ctx.stroke()
  ctx.fill()
}

export {
  drawGrid,
  drawBezier,
  drawControlHandle,
}
