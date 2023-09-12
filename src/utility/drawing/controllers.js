/* eslint-disable no-param-reassign */

import theme from '../../ui/theme'

// TODO: draw this on top of all other items
// TODO: ^ with that, potentially also draw an invisible box where the shape exists
//         so that layers underneath can be moved without accidentaly selecting
//         the item(s) above it
const drawControllerBox = (instance) => {
  /* instance: type Shape */
  const { controllerType, ctx, origin, scale, strokeWidth, rectSpec } = instance
  const [rectX, rectY, rectW, rectH] = rectSpec
  const strokeProtrusion = strokeWidth / 2

  ctx.setTransform(instance.currentTransform)

  // strong outline
  ctx.beginPath()
  if (controllerType === 'Line') {
    ctx.moveTo(rectX, rectY + rectH / 2)
    ctx.lineTo(rectX + rectW, rectY + rectH / 2)
    ctx.lineWidth = 2
  } else {
    ctx.rect(
      rectX - strokeProtrusion - (3 / scale.x),
      rectY - strokeProtrusion - (3 / scale.y),
      rectW + strokeWidth + (6 / scale.x),
      rectH + strokeWidth + (6 / scale.y),
    )
    ctx.lineWidth = 6
  }
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()

  // handles
  ctx.setTransform(instance.currentTransform)
  ctx.beginPath()
  if (controllerType === 'Line') {
    ctx.rect(
      rectX - (8 / scale.x),
      rectY + rectH / 2 - (8 / scale.y),
      16 / scale.x,
      16 / scale.y,
    )
    ctx.rect(
      (rectX + rectW) - (8 / scale.x),
      rectY + rectH / 2 - (8 / scale.y),
      16 / scale.x,
      16 / scale.y,
    )
  } else {
    ctx.rect(
      rectX - strokeProtrusion - (11 / scale.x),
      rectY - strokeProtrusion - (11 / scale.y),
      16 / scale.x,
      16 / scale.y,
    )
    ctx.rect(
      (rectX + rectW) + strokeProtrusion - (5 / scale.x),
      rectY - strokeProtrusion - (11 / scale.y),
      16 / scale.x,
      16 / scale.y,
    )
    ctx.rect(
      (rectX + rectW) + strokeProtrusion - (5 / scale.x),
      (rectY + rectH) + strokeProtrusion - (5 / scale.y),
      16 / scale.x,
      16 / scale.y,
    )
    ctx.rect(
      rectX - strokeProtrusion - (11 / scale.x),
      (rectY + rectH) + strokeProtrusion - (5 / scale.y),
      16 / scale.x,
      16 / scale.y,
    )
  }
  ctx.fillStyle = `${theme.palette.WHITE}`
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.lineWidth = 6
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.fill()
  ctx.stroke()

  // origin
  ctx.setTransform(instance.currentTransform)
  ctx.translate(origin.x, origin.y)
  ctx.beginPath()
  ctx.moveTo(0 / scale.x, -10 / scale.y)
  ctx.lineTo(0 / scale.x, 10 / scale.y)
  ctx.moveTo(-10 / scale.x, 0 / scale.y)
  ctx.lineTo(10 / scale.x, 0 / scale.y)
  ctx.lineWidth = 8
  ctx.lineJoin = 'miter'
  ctx.strokeStyle = `${theme.palette.WHITE}`
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()
  // -- more
  ctx.setTransform(instance.currentTransform)
  ctx.translate(origin.x, origin.y)
  ctx.beginPath()
  ctx.moveTo(0 / scale.x, -8 / scale.y)
  ctx.lineTo(0 / scale.x, 8 / scale.y)
  ctx.moveTo(-8 / scale.x, 0 / scale.y)
  ctx.lineTo(8 / scale.x, 0 / scale.y)
  ctx.lineWidth = 4
  ctx.lineJoin = 'miter'
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()

  // rotation handle
  ctx.setTransform(instance.currentTransform)
  if (controllerType === 'Line' || controllerType === 'Path') {
    ctx.translate(origin.x, origin.y)
  } else {
    ctx.translate(rectX + rectW / 2, rectY - strokeProtrusion)
  }
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0 / scale.x, -75 / scale.y)
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.lineWidth = 6
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()
  // -- rotation circle
  ctx.setTransform(instance.currentTransform)
  if (controllerType === 'Line' || controllerType === 'Path') {
    ctx.translate(origin.x, origin.y)
  } else {
    ctx.translate(rectX + rectW / 2, rectY - strokeProtrusion)
  }
  ctx.beginPath()
  ctx.ellipse(
    0,
    -75 / scale.y,
    8 / scale.x,
    8 / scale.y,
    0,
    0,
    Math.PI * 2
  )
  ctx.fillStyle = `${theme.palette.WHITE}`
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.lineWidth = 6
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.fill()
  ctx.stroke()
}

const ContainerControllerSizes = {
  originBox: 100,
  positionBox: 200,
  rotationCircle: 12,
}
const drawContainerController = (ctx, isPositionHovered, isOriginHovered) => {
  const { originBox, positionBox, rotationCircle } = ContainerControllerSizes

  ctx.strokeStyle = `${theme.palette.tertiary[100]}`
  ctx.lineWidth = 2
  ctx.lineJoin = 'miter'

  ctx.beginPath()
  ctx.rect(originBox / -2, originBox / -2, originBox, originBox)
  ctx.stroke()
  if (isOriginHovered) {
    ctx.fillStyle = `${theme.palette.tertiary[20]}`
    ctx.fill()
  }

  ctx.beginPath()
  ctx.rect(positionBox / -2, positionBox / -2, positionBox, positionBox)
  ctx.stroke()
  if (isPositionHovered) {
    ctx.beginPath()
    ctx.rect(positionBox / -2, positionBox / -2, positionBox, positionBox)
    ctx.rect(originBox / -2, originBox / -2, originBox, originBox)
    ctx.fillStyle = `${theme.palette.tertiary[20]}`
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

export {
  drawControllerBox,
  ContainerControllerSizes,
  drawContainerController,
}
