/* eslint-disable no-param-reassign */

// TODO: draw this on top of all other items
// TODO: ^ with that, potentially also draw an invisible box where the shape exists
//         so that layers underneath can be moved without accidentaly selecting
//         the item(s) above it

const draw = (instance) => {
  instance.ctx.setTransform(instance.currentTransform)

  instance.ctx.beginPath()
  const strokeProtrusion = instance.stroke.width / 2
  instance.ctx.rect(
    instance.rectSpec[0] - strokeProtrusion - (3 / instance.scale.x),
    instance.rectSpec[1] - strokeProtrusion - (3 / instance.scale.y),
    instance.rectSpec[2] + instance.stroke.width + (6 / instance.scale.x),
    instance.rectSpec[3] + instance.stroke.width + (6 / instance.scale.y),
  )
  instance.ctx.strokeStyle = 'rgba(33, 150, 243)'
  instance.ctx.lineWidth = 6
  instance.ctx.setTransform(instance.currentTransformWithoutScale)
  instance.ctx.stroke()

  // handles
  instance.ctx.setTransform(instance.currentTransform)
  instance.ctx.beginPath()
  instance.ctx.rect(
    instance.rectSpec[0] - strokeProtrusion - (11 / instance.scale.x),
    instance.rectSpec[1] - strokeProtrusion - (11 / instance.scale.y),
    16 / instance.scale.x,
    16 / instance.scale.y,
  )
  instance.ctx.rect(
    (instance.rectSpec[0] * -1) + strokeProtrusion - (5 / instance.scale.x),
    instance.rectSpec[1] - strokeProtrusion - (11 / instance.scale.y),
    16 / instance.scale.x,
    16 / instance.scale.y,
  )
  instance.ctx.rect(
    (instance.rectSpec[0] * -1) + strokeProtrusion - (5 / instance.scale.x),
    (instance.rectSpec[1] * -1) + strokeProtrusion - (5 / instance.scale.y),
    16 / instance.scale.x,
    16 / instance.scale.y,
  )
  instance.ctx.rect(
    instance.rectSpec[0] - strokeProtrusion - (11 / instance.scale.x),
    (instance.rectSpec[1] * -1) + strokeProtrusion - (5 / instance.scale.y),
    16 / instance.scale.x,
    16 / instance.scale.y,
  )
  instance.ctx.fillStyle = 'white'
  instance.ctx.strokeStyle = 'rgb(33, 150, 243)'
  instance.ctx.lineWidth = 6
  instance.ctx.setTransform(instance.currentTransformWithoutScale)
  instance.ctx.fill()
  instance.ctx.stroke()

  // origin
  instance.ctx.setTransform(instance.currentTransform)
  instance.ctx.translate(instance.origin.x, instance.origin.y)
  instance.ctx.beginPath()
  instance.ctx.moveTo(0 / instance.scale.x, -10 / instance.scale.y)
  instance.ctx.lineTo(0 / instance.scale.x, 10 / instance.scale.y)
  instance.ctx.moveTo(-10 / instance.scale.x, 0 / instance.scale.y)
  instance.ctx.lineTo(10 / instance.scale.x, 0 / instance.scale.y)
  instance.ctx.lineWidth = 8
  instance.ctx.strokeStyle = 'white'
  instance.ctx.setTransform(instance.currentTransformWithoutScale)
  instance.ctx.stroke()
  // -- more
  instance.ctx.setTransform(instance.currentTransform)
  instance.ctx.translate(instance.origin.x, instance.origin.y)
  instance.ctx.beginPath()
  instance.ctx.moveTo(0 / instance.scale.x, -8 / instance.scale.y)
  instance.ctx.lineTo(0 / instance.scale.x, 8 / instance.scale.y)
  instance.ctx.moveTo(-8 / instance.scale.x, 0 / instance.scale.y)
  instance.ctx.lineTo(8 / instance.scale.x, 0 / instance.scale.y)
  instance.ctx.lineWidth = 4
  instance.ctx.strokeStyle = 'rgb(33, 150, 243)'
  instance.ctx.setTransform(instance.currentTransformWithoutScale)
  instance.ctx.stroke()

  // rotation handle
  instance.ctx.setTransform(instance.currentTransform)
  instance.ctx.translate(0, instance.height / -2 + strokeProtrusion)
  instance.ctx.beginPath()
  instance.ctx.moveTo(0, 0)
  instance.ctx.lineTo(0 / instance.scale.x, -75 / instance.scale.y)
  instance.ctx.strokeStyle = 'rgba(33, 150, 243)'
  instance.ctx.lineWidth = 6
  instance.ctx.setTransform(instance.currentTransformWithoutScale)
  instance.ctx.stroke()
  // -- more
  instance.ctx.setTransform(instance.currentTransform)
  instance.ctx.translate(0, instance.height / -2 + strokeProtrusion)
  instance.ctx.beginPath()
  instance.ctx.ellipse(
    0,
    -75 / instance.scale.y,
    8 / instance.scale.x,
    8 / instance.scale.y,
    0,
    0,
    Math.PI * 2
  )
  instance.ctx.fillStyle = 'white'
  instance.ctx.strokeStyle = 'rgb(33, 150, 243)'
  instance.ctx.lineWidth = 6
  instance.ctx.setTransform(instance.currentTransformWithoutScale)
  instance.ctx.fill()
  instance.ctx.stroke()
}

export default { draw }
