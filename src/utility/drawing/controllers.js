/* eslint-disable no-param-reassign */

import theme from '../../ui/theme'

const HANDLE_STROKE_WIDTH = 6
const ROTATION_LINE_DISTANCE = 50

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

const setControllerHandleEllipseOnCtx = (instance, whichHandle, forHoverCheck = false) => {
  const { ctx, origin, scale } = instance
  const handleStrokeWidth = forHoverCheck ? HANDLE_STROKE_WIDTH : 0

  ctx.translate(origin.x, origin.y)

  let handleEllipseSpec = [0, 0, 0, 0, 0, 0, 0]
  if (whichHandle === 100) {
    handleEllipseSpec = [
      0,
      -ROTATION_LINE_DISTANCE / scale.y,
      (8 + handleStrokeWidth) / scale.x,
      (8 + handleStrokeWidth) / scale.y,
      0,
      0,
      Math.PI * 2,
    ]
  }

  ctx.ellipse(...handleEllipseSpec)
  return handleEllipseSpec
}

// TODO [3]: draw this on top of all other items
// TODO [3]: ^ with that, potentially also draw an invisible box where the shape exists
//         so that layers underneath can be moved without accidentaly selecting
//         the item(s) above it
const drawControllerBox = (instance, handleIdxHovered, handleIdxActive) => {
  /* instance: type Shape */
  const { controllerType, ctx, origin, scale, strokeWidth, rectSpec } = instance
  const [rectX, rectY, rectW, rectH] = rectSpec
  const handleIdxActiveOrHovered = handleIdxActive != null ? handleIdxActive : handleIdxHovered
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
    [0, 1].forEach((idx) => {
      if (handleIdxActiveOrHovered !== idx) {
        setControllerHandleRectOnCtx(instance, idx)
      }
    })
  } else {
    // This controller will be a 4-pointed rectangle
    [0, 1, 2, 3].forEach((idx) => {
      if (handleIdxActiveOrHovered !== idx) {
        setControllerHandleRectOnCtx(instance, idx)
      }
    })
  }
  ctx.fillStyle = `${theme.palette.WHITE}`
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.lineWidth = HANDLE_STROKE_WIDTH
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.fill()
  ctx.stroke()

  // hovered handle ?
  if (handleIdxActiveOrHovered != null) {
    // This may seem redundant but that's because I stroke and fill all the others at once time
    ctx.setTransform(instance.currentTransform)
    ctx.beginPath()
    setControllerHandleRectOnCtx(instance, handleIdxActiveOrHovered)
    ctx.fillStyle = `${theme.palette.WHITE}`
    ctx.strokeStyle = handleIdxActive != null ? `${theme.palette.secondary[100]}` : `${theme.palette.tertiary[100]}`
    ctx.lineWidth = HANDLE_STROKE_WIDTH
    ctx.lineJoin = 'miter'
    ctx.setTransform(instance.currentTransformWithoutScale)
    ctx.fill()
    ctx.stroke()
  }

  // rotation handle
  ctx.setTransform(instance.currentTransform)
  ctx.translate(origin.x, origin.y)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0 / scale.x, -ROTATION_LINE_DISTANCE / scale.y)
  ctx.strokeStyle = `${theme.palette.primary[100]}`
  ctx.lineWidth = HANDLE_STROKE_WIDTH
  ctx.lineJoin = 'miter'
  ctx.setTransform(instance.currentTransformWithoutScale)
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

  // rotation circle
  // TODO [4]: Rotation controls obscure the item too much, take a different approach
  //       Maybe create an invisible circle around the origin at a certain radius that is adjustable
  //       Or check for the pointer to be a bit outside one of the control handles
  ctx.setTransform(instance.currentTransform)
  ctx.beginPath()
  setControllerHandleEllipseOnCtx(instance, 100)
  ctx.fillStyle = `${theme.palette.WHITE}`
  let rotationCircleStrokeStyle = `${theme.palette.primary[100]}`
  if (handleIdxActive === 100) {
    rotationCircleStrokeStyle = `${theme.palette.secondary[100]}`
  } else if (handleIdxHovered === 100) {
    rotationCircleStrokeStyle = `${theme.palette.tertiary[100]}`
  }
  ctx.strokeStyle = rotationCircleStrokeStyle
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
  ctx.lineTo(0, -originBox - ROTATION_LINE_DISTANCE)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(
    0,
    -originBox - ROTATION_LINE_DISTANCE - rotationCircle,
    rotationCircle,
    rotationCircle,
    Math.PI * 2,
    0,
    Math.PI * 2,
  )
  ctx.stroke()
}

export {
  setControllerHandleRectOnCtx,
  setControllerHandleEllipseOnCtx,
  drawControllerBox,
  ContainerControllerSizes,
  drawContainerController,
}
