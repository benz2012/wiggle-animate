import { observable } from 'mobx'

import Handle from './Handle'
import bezierApproximation from '../util/bezierApproximation'

class Keyframe {
  static get OBSERVABLES() {
    return ['frame', 'value', 'handleIn', 'handleOut']
  }

  @observable frame
  @observable value
  @observable handleIn
  @observable handleOut

  constructor(frame, value) {
    this.frame = frame
    this.value = value
    this.handleIn = new Handle('IN')
    this.handleOut = new Handle('OUT')
  }

  toJSON() {
    return ({
      frame: this.frame,
      value: this.value,
      handleIn: this.handleIn.toJSON(),
      handleOut: this.handleOut.toJSON(),
    })
  }

  static fromJSON(input) {
    const { frame, value, handleIn, handleOut } = input
    const keyframe = new Keyframe(frame, value)
    keyframe.handleIn.influence = handleIn.influence
    keyframe.handleIn.distance = handleIn.distance
    keyframe.handleOut.influence = handleOut.influence
    keyframe.handleOut.distance = handleOut.distance
    return keyframe
  }

  static sort = (a, b) => (a.frame - b.frame)

  static interpolate = (k1, k2, frame) => {
    // TODO: cache the curve creation to reduce computation
    const curve = bezierApproximation(
      {
        x2: k1.handleOut.position.x,
        y2: k1.handleOut.position.y,
        x3: k2.handleIn.position.x,
        y3: k2.handleIn.position.y,
      },
      k2.frame - k1.frame - 1
    )

    const timeRatio = (frame - k1.frame) / (k2.frame - k1.frame)
    const valueRatio = curve.y(timeRatio)
    const interpolated = ((k2.value - k1.value) * valueRatio) + k1.value

    return interpolated
  }
}

export default Keyframe
