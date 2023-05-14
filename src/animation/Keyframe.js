import Handle from './Handle'
import bezierApproximation from './Bezier'
import { observeListOfProperties } from '../utility/state'

class Keyframe {
  static curveCache = {}

  constructor(frame, value) {
    this.frame = frame
    this.value = value
    this.handleIn = new Handle('IN')
    this.handleOut = new Handle('OUT')

    this.observables = ['frame', 'value', 'handleIn', 'handleOut']
    this.nestedObservables = ['handleIn', 'handleOut']
    observeListOfProperties(this, this.observables)
  }

  static sort = (a, b) => (a.frame - b.frame)

  static interpolate = (k1, k2, frame) => {
    const curveParams = [
      {
        x2: k1.handleOut.position.x,
        y2: k1.handleOut.position.y,
        x3: k2.handleIn.position.x,
        y3: k2.handleIn.position.y,
      },
      k2.frame - k1.frame - 1,
    ]
    const curveParamsSerialized = JSON.stringify(curveParams)
    let curve
    if (curveParamsSerialized in Keyframe.curveCache) {
      curve = Keyframe.curveCache[curveParamsSerialized]
    } else {
      curve = bezierApproximation(...curveParams)
      Keyframe.curveCache[curveParamsSerialized] = curve
    }

    const timeRatio = (frame - k1.frame) / (k2.frame - k1.frame)
    const valueRatio = curve.y(timeRatio)
    const interpolated = ((k2.value - k1.value) * valueRatio) + k1.value

    return interpolated
  }
}

export default Keyframe
