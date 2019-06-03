import bezierCurve from '../util/bezierCurve'

class Handle {
  constructor(type) {
    this.type = type
    this.influence = type === 'OUT' ? 0.3 : 1
    this.distance = 0
  }

  get position() {
    let x = this.influence
    let y = this.distance
    if (this.type === 'IN') {
      x = 1 - this.influence
      y = 1 - this.distance
    }
    return { x, y }
  }
}

class Keyframe {
  constructor(frame, value) {
    this.frame = frame
    this.value = value
    this.handleIn = new Handle('IN')
    this.handleOut = new Handle('OUT')
  }

  static sort = (a, b) => (a.frame - b.frame)

  static createCurve = (k1, k2) => (
    bezierCurve({
      x2: k1.handleOut.position.x,
      y2: k1.handleOut.position.y,
      x3: k2.handleIn.position.x,
      y3: k2.handleIn.position.y,
    })
  )

  static interpolate = (k1, k2, frame) => {
    const curve = Keyframe.createCurve(k1, k2)
    const timeRatio = (frame - k1.frame) / (k2.frame - k1.frame)
    const valueRatio = curve.y(timeRatio)
    const interpolated = ((k2.value - k1.value) * valueRatio) + k1.value
    return interpolated
  }
}

export default Keyframe
