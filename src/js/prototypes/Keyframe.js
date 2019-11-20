// import { observable } from 'mobx'

import Handle from './Handle'
import bezierCurve from '../util/bezierCurve'

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
