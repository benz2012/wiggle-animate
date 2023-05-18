/* eslint-disable no-param-reassign */

// TODO: draw this on top of all other items
// TODO: ^ with that, potentially also draw an invisible box where the shape exists
//         so that layers underneath can be moved without accidentaly selecting
//         the item(s) above it

const draw = (instance) => {
  const { ctx, origin, scale, stroke, rectSpec } = instance
  const [rectX, rectY, rectW, rectH] = rectSpec

  ctx.setTransform(instance.currentTransform)

  ctx.beginPath()
  const strokeProtrusion = stroke.width / 2
  ctx.rect(
    rectX - strokeProtrusion - (3 / scale.x),
    rectY - strokeProtrusion - (3 / scale.y),
    rectW + stroke.width + (6 / scale.x),
    rectH + stroke.width + (6 / scale.y),
  )
  ctx.strokeStyle = 'rgba(33, 150, 243)'
  ctx.lineWidth = 6
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()

  // handles
  ctx.setTransform(instance.currentTransform)
  ctx.beginPath()
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
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'rgb(33, 150, 243)'
  ctx.lineWidth = 6
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
  ctx.strokeStyle = 'white'
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
  ctx.strokeStyle = 'rgb(33, 150, 243)'
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()

  // rotation handle
  ctx.setTransform(instance.currentTransform)
  ctx.translate(rectX + rectW / 2, rectY - strokeProtrusion)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0 / scale.x, -75 / scale.y)
  ctx.strokeStyle = 'rgba(33, 150, 243)'
  ctx.lineWidth = 6
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.stroke()
  // -- more
  ctx.setTransform(instance.currentTransform)
  ctx.translate(rectX + rectW / 2, rectY - strokeProtrusion)
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
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'rgb(33, 150, 243)'
  ctx.lineWidth = 6
  ctx.setTransform(instance.currentTransformWithoutScale)
  ctx.fill()
  ctx.stroke()
}

export default { draw }
