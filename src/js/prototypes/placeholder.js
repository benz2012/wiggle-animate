import Circle from './items/Circle'
import Rectangle from './items/Rectangle'

const setLength = (animation) => {
  animation.setLength(200)
}

const setRange = (animation) => {
  animation.setIn(60)
  animation.setOut(140)
}

const addItems = (canvas) => {
  const circle = new Circle({ key: 'circle1' })
  circle.addKey('x', 60, 25)
  circle.addKey('y', 60, 25)
  circle.addKey('x', 90, 75)
  circle.addKey('y', 90, 50)
  circle.addKey('scale', 60, 1)
  circle.addKey('scale', 90, 2.5)
  circle.addKey('scale', 100, 2.5)
  circle.addKey('scale', 130, 1)
  canvas.add(circle)

  const rect = new Rectangle({
    key: 'rect1',
    width: 20,
    radius: 10,
  })
  rect.addKey('rotation', 80, 0)
  rect.addKey('rotation', 140, 360)
  rect.addKey('scale', 80, 0)
  rect.addKey('scale', 140, 1)
  canvas.add(rect)
}

export default {
  setLength,
  setRange,
  addItems,
}
