import theme from '../../ui/theme'

const POINT_RADIUS = 7.5
const POINT_THICKNESS = 3

const strokeWithoutScale = (ctx, scaleVector) => {
  ctx.scale(1 / scaleVector.x, 1 / scaleVector.y)
  ctx.stroke()
  ctx.scale(scaleVector.x, scaleVector.y)
}

const fillWithoutScale = (ctx, scaleVector) => {
  ctx.scale(1 / scaleVector.x, 1 / scaleVector.y)
  ctx.fill()
  ctx.scale(scaleVector.x, scaleVector.y)
}

const drawPotentialPathPoint = (ctx, brightCanvas = false) => {
  // These are highly specific to this component, no need to theme them
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  if (brightCanvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
  }

  // Dull Point
  const outerRadius = 6
  ctx.beginPath()
  ctx.ellipse(0, 0, outerRadius, outerRadius, 0, 0, Math.PI * 2)
  ctx.fill()

  // Cross
  ctx.beginPath()
  ctx.rect(-18, -25, 2, 16)
  ctx.rect(-25, -18, 16, 2)
  ctx.fill()
}

const setPointRectOnCtx = (ctx, scaleVector, forHoverCheck = false) => {
  let rectSize = POINT_RADIUS * 2
  if (forHoverCheck) {
    rectSize += POINT_THICKNESS
  }
  ctx.rect(
    (rectSize / -2) / scaleVector.x,
    (rectSize / -2) / scaleVector.y,
    (rectSize) / scaleVector.x,
    (rectSize) / scaleVector.y,
  )
}

const setControlPointEllipseOnCtx = (ctx, scaleVector, forHoverCheck = false) => {
  let radius = POINT_RADIUS
  if (forHoverCheck) {
    radius = POINT_RADIUS + (POINT_THICKNESS / 2)
  }
  ctx.ellipse(0, 0, radius / scaleVector.x, radius / scaleVector.y, 0, 0, Math.PI * 2)
}

const drawPathPoint = (ctx, scaleVector, isHovered = false) => {
  // Hovered Outer Stroke
  if (isHovered) {
    const outerThickness = 2
    const outerRectSize = (POINT_RADIUS * 2) + (POINT_THICKNESS) + (outerThickness)
    ctx.beginPath()
    ctx.rect(
      (outerRectSize / -2) / scaleVector.x,
      (outerRectSize / -2) / scaleVector.y,
      (outerRectSize) / scaleVector.x,
      (outerRectSize) / scaleVector.y,
    )
    ctx.strokeStyle = `${theme.palette.secondary[100]}`
    ctx.lineWidth = outerThickness
    strokeWithoutScale(ctx, scaleVector)
  }

  // The Point
  ctx.beginPath()
  setPointRectOnCtx(ctx, scaleVector)
  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  ctx.lineWidth = POINT_THICKNESS
  strokeWithoutScale(ctx, scaleVector)

  // Dull Center
  if (isHovered) {
    const innerRectSize = (POINT_RADIUS * 2) - (POINT_THICKNESS)
    ctx.beginPath()
    ctx.rect(
      (innerRectSize / -2) / scaleVector.x,
      (innerRectSize / -2) / scaleVector.y,
      (innerRectSize) / scaleVector.x,
      (innerRectSize) / scaleVector.y,
    )
    ctx.fillStyle = `${theme.palette.tertiary[50]}`
    fillWithoutScale(ctx, scaleVector)
  }
}

const drawPathControlPoint = (ctx, scaleVector, isHovered = false) => {
  // Hovered Outer Stroke
  if (isHovered) {
    const outerThickness = 2
    const outerRadius = POINT_RADIUS + (POINT_THICKNESS / 2) + (outerThickness / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, outerRadius / scaleVector.x, outerRadius / scaleVector.y, 0, 0, Math.PI * 2)
    ctx.strokeStyle = `${theme.palette.secondary[100]}`
    ctx.lineWidth = outerThickness
    strokeWithoutScale(ctx, scaleVector)
  }

  // The Point
  ctx.beginPath()
  setControlPointEllipseOnCtx(ctx, scaleVector)
  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  ctx.lineWidth = POINT_THICKNESS
  strokeWithoutScale(ctx, scaleVector)

  // Dull Point Center
  if (isHovered) {
    const innerRadius = POINT_RADIUS - (POINT_THICKNESS / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, innerRadius / scaleVector.x, innerRadius / scaleVector.y, 0, 0, Math.PI * 2)
    ctx.fillStyle = `${theme.palette.tertiary[50]}`
    fillWithoutScale(ctx, scaleVector)
  }
}

const drawPathControlLine = (ctx, scaleVector, toPointX, toPointY, isHovered = false) => {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(toPointX, toPointY)

  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  if (isHovered) {
    ctx.strokeStyle = `${theme.palette.secondary[100]}`
  }
  ctx.lineWidth = POINT_THICKNESS
  strokeWithoutScale(ctx, scaleVector)
}

export {
  drawPotentialPathPoint,
  drawPathPoint,
  drawPathControlPoint,
  drawPathControlLine,
  setPointRectOnCtx,
  setControlPointEllipseOnCtx,
}
