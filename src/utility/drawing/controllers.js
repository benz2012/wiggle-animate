/* eslint-disable no-param-reassign */

import theme from '../../ui/theme'

const HANDLE_STROKE_WIDTH = 6

const setControllerHandleRectOnCtx = (instance, whichHandle, forHoverCheck = false) => {
  const { controllerType, ctx, scale, strokeWidth, rectSpec } = instance
  const [rectX, rectY, rectW, rectH] = rectSpec
  const strokeProtrusion = strokeWidth / 2

  const handleStrokeWidth = forHoverCheck ? HANDLE_STROKE_WIDTH : 0
  const handleHalfStroke = handleStrokeWidth / 2

  let handleRectSpec = [0, 0, 0, 0]
  if (whichHandle === 0) {
    if (controllerType === 'Line') {
      handleRectSpec = [
        rectX - (8 / scale.x) - (handleHalfStroke / scale.x),
        rectY + rectH / 2 - (8 / scale.y) - (handleHalfStroke / scale.y),
        (16 + handleStrokeWidth) / scale.x,
        (16 + handleStrokeWidth) / scale.y,
      ]
    } else {
      handleRectSpec = [
        rectX - strokeProtrusion - (11 / scale.x) - (handleHalfStroke / scale.x),
        rectY - strokeProtrusion - (11 / scale.y) - (handleHalfStroke / scale.y),
        (16 + handleStrokeWidth) / scale.x,
        (16 + handleStrokeWidth) / scale.y,
      ]
    }
  } else if (whichHandle === 1) {
    if (controllerType === 'Line') {
      handleRectSpec = [
        (rectX + rectW) - (8 / scale.x) - (handleHalfStroke / scale.x),
        rectY + rectH / 2 - (8 / scale.y) - (handleHalfStroke / scale.y),
        (16 + handleStrokeWidth) / scale.x,
        (16 + handleStrokeWidth) / scale.y,
      ]
    } else {
      handleRectSpec = [
        (rectX + rectW) + strokeProtrusion - (5 / scale.x) - (handleHalfStroke / scale.x),
        rectY - strokeProtrusion - (11 / scale.y) - (handleHalfStroke / scale.y),
        (16 + handleStrokeWidth) / scale.x,
        (16 + handleStrokeWidth) / scale.y,
      ]
    }
  } else if (whichHandle === 2) {
    handleRectSpec = [
      (rectX + rectW) + strokeProtrusion - (5 / scale.x) - (handleHalfStroke / scale.x),
      (rectY + rectH) + strokeProtrusion - (5 / scale.y) - (handleHalfStroke / scale.y),
      (16 + handleStrokeWidth) / scale.x,
      (16 + handleStrokeWidth) / scale.y,
    ]
  } else if (whichHandle === 3) {
    handleRectSpec = [
      rectX - strokeProtrusion - (11 / scale.x) - (handleHalfStroke / scale.x),
      (rectY + rectH) + strokeProtrusion - (5 / scale.y) - (handleHalfStroke / scale.y),
      (16 + handleStrokeWidth) / scale.x,
      (16 + handleStrokeWidth) / scale.y,
    ]
  }

  ctx.rect(...handleRectSpec)
  return handleRectSpec
}

// TODO: draw this on top of all other items
// TODO: ^ with that, potentially also draw an invisible box where the shape exists
//         so that layers underneath can be moved without accidentaly selecting
//         the item(s) above it
const drawControllerBox = (instance, handleIdxHovered) => {
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
    // This controller will be a 2-pointed line
    if (handleIdxHovered !== 0) { setControllerHandleRectOnCtx(instance, 0) }
    if (handleIdxHovered !== 1) { setControllerHandleRectOnCtx(instance, 1) }
  } else {
    // This controller will be a 4-pointed rectangle
    if (handleIdxHovered !== 0) { setControllerHandleRectOnCtx(instance, 0) }
    if (handleIdxHovered !== 1) { setControllerHandleRectOnCtx(instance, 1) }
    if (handleIdxHovered !== 2) { setControllerHandleRectOnCtx(instance, 2) }
    if (handleIdxHovered !== 3) { setControllerHandleRectOnCtx(instance, 3) }
  }
  ctx.fillStyle = `${theme.palette.WHITE}`
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.lineWidth = HANDLE_STROKE_WIDTH
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.fill()
  ctx.stroke()

  // hovered handle ?
  if (handleIdxHovered != null) {
    ctx.setTransform(instance.currentTransform)
    ctx.beginPath()
    setControllerHandleRectOnCtx(instance, handleIdxHovered)
    ctx.fillStyle = `${theme.palette.WHITE}`
    ctx.strokeStyle = `${theme.palette.tertiary[100]}`
    ctx.lineWidth = HANDLE_STROKE_WIDTH
    ctx.lineJoin = 'miter'
    ctx.setTransform(instance.currentTransformWithoutScale)
    ctx.fill()
    ctx.stroke()
  }

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
  ctx.lineWidth = HANDLE_STROKE_WIDTH
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
  ctx.lineWidth = HANDLE_STROKE_WIDTH
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
  setControllerHandleRectOnCtx,
  drawControllerBox,
  ContainerControllerSizes,
  drawContainerController,
}
