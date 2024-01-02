import theme from '../../ui/theme'

const POINT_RADIUS = 7.5
const POINT_THICKNESS = 3

// TODO [1]: de-scale control points before drawing them so they stay nice and small

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

const setPointRectOnCtx = (ctx, forHoverCheck = false) => {
  let rectSize = POINT_RADIUS * 2
  if (forHoverCheck) {
    rectSize += POINT_THICKNESS
  }
  ctx.rect(rectSize / -2, rectSize / -2, rectSize, rectSize)
}

const setControlPointEllipseOnCtx = (ctx, forHoverCheck = false) => {
  let radius = POINT_RADIUS
  if (forHoverCheck) {
    radius = POINT_RADIUS + (POINT_THICKNESS / 2)
  }
  ctx.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2)
}

const drawPathPoint = (ctx, isHovered = false) => {
  // Hovered Outer Stroke
  if (isHovered) {
    const outerThickness = 2
    const outerRectSize = (POINT_RADIUS * 2) + (POINT_THICKNESS) + (outerThickness)
    ctx.beginPath()
    ctx.rect(outerRectSize / -2, outerRectSize / -2, outerRectSize, outerRectSize)
    ctx.strokeStyle = `${theme.palette.secondary[100]}`
    ctx.lineWidth = outerThickness
    ctx.stroke()
  }

  // The Point
  ctx.beginPath()
  setPointRectOnCtx(ctx)
  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  ctx.lineWidth = POINT_THICKNESS
  ctx.stroke()

  // Dull Center
  if (isHovered) {
    const innerRectSize = (POINT_RADIUS * 2) - (POINT_THICKNESS)
    ctx.beginPath()
    ctx.rect(innerRectSize / -2, innerRectSize / -2, innerRectSize, innerRectSize)
    ctx.fillStyle = `${theme.palette.tertiary[50]}`
    ctx.fill()
  }
}

const drawPathControlPoint = (ctx, isHovered = false) => {
  // Hovered Outer Stroke
  if (isHovered) {
    const outerThickness = 2
    const outerRadius = POINT_RADIUS + (POINT_THICKNESS / 2) + (outerThickness / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, outerRadius, outerRadius, 0, 0, Math.PI * 2)
    ctx.strokeStyle = `${theme.palette.secondary[100]}`
    ctx.lineWidth = outerThickness
    ctx.stroke()
  }

  // The Point
  ctx.beginPath()
  setControlPointEllipseOnCtx(ctx)
  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  ctx.lineWidth = POINT_THICKNESS
  ctx.stroke()

  // Dull Point Center
  if (isHovered) {
    const innerRadius = POINT_RADIUS - (POINT_THICKNESS / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, innerRadius, innerRadius, 0, 0, Math.PI * 2)
    ctx.fillStyle = `${theme.palette.tertiary[50]}`
    ctx.fill()
  }
}

const drawPathControlLine = (ctx, toPointX, toPointY, isHovered = false) => {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(toPointX, toPointY)

  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  if (isHovered) {
    ctx.strokeStyle = `${theme.palette.secondary[100]}`
  }
  ctx.lineWidth = POINT_THICKNESS
  ctx.stroke()
}

export {
  drawPotentialPathPoint,
  drawPathPoint,
  drawPathControlPoint,
  drawPathControlLine,
  setPointRectOnCtx,
  setControlPointEllipseOnCtx,
}
