import theme from '../../ui/theme'

const POINT_RADIUS = 7.5
const POINT_THICKNESS = 3

const drawPotentialPathPoint = (ctx, brightCanvas = false) => {
  // NOTE: Here I use evenodd fill with a circle cutout instead of stroking a path
  //       so that I only have to manage a single style

  // These are highly specific to this component, no need to theme them
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  if (brightCanvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
  }

  // Dull Point
  const outerRadius = POINT_RADIUS + (POINT_THICKNESS / 2)
  const innerRadius = POINT_RADIUS - (POINT_THICKNESS / 2)
  ctx.beginPath()
  ctx.ellipse(0, 0, outerRadius, outerRadius, 0, 0, Math.PI * 2)
  ctx.ellipse(0, 0, innerRadius, innerRadius, 0, 0, Math.PI * 2)
  ctx.fill('evenodd')

  // Cross
  ctx.beginPath()
  ctx.rect(-18, -25, 2, 16)
  ctx.rect(-25, -18, 16, 2)
  ctx.fill()
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
  const rectSize = POINT_RADIUS * 2
  ctx.beginPath()
  ctx.rect(-POINT_RADIUS, -POINT_RADIUS, rectSize, rectSize)
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
  ctx.ellipse(0, 0, POINT_RADIUS, POINT_RADIUS, 0, 0, Math.PI * 2)
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
}
