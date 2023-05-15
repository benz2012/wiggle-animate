import Handle from './Handle'
import bezierApproximation from './Bezier'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import Color from '../visuals/Color'
import { observeListOfProperties } from '../utility/state'
import { isObject } from '../utility/object'
import { isString, START_OF_NORMAL_CHARS, END_OF_NORMAL_CHARS } from '../utility/string'

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

    // Choose interpolation method based on value type
    const oneValue = k1.value
    let interpolated = k1.value
    if (Number.isFinite(oneValue)) {
      interpolated = ((k2.value - k1.value) * valueRatio) + k1.value
    } else if (isObject(oneValue) && 'x' in oneValue && 'y' in oneValue) {
      interpolated = {
        x: ((k2.value.x - k1.value.x) * valueRatio) + k1.value.x,
        y: ((k2.value.y - k1.value.y) * valueRatio) + k1.value.y,
      }
    } else if (oneValue instanceof Vector2) {
      interpolated = new Vector2(
        ((k2.value.x - k1.value.x) * valueRatio) + k1.value.x,
        ((k2.value.y - k1.value.y) * valueRatio) + k1.value.y,
      )
    } else if (oneValue instanceof Angle) {
      interpolated = new Angle(
        ((k2.value.degrees - k1.value.degrees) * valueRatio) + k1.value.degrees
      )
    } else if (isString(oneValue)) {
      const startingCharCodes = Array.from(k1.value).map((char) => char.charCodeAt(0))
      const endingCharCodes = Array.from(k2.value).map((char) => char.charCodeAt(0))
      const interpolatedLength = Math.floor(((k2.value.length - k1.value.length) * valueRatio) + k1.value.length)
      const interpolatedCharCodes = Array.from(Array(interpolatedLength)).map((_, index) => {
        const startingCharCode = startingCharCodes[index] ?? START_OF_NORMAL_CHARS
        const endingCharCode = endingCharCodes[index] ?? END_OF_NORMAL_CHARS
        const interpolatedCharCode = Math.ceil(((endingCharCode - startingCharCode) * valueRatio) + startingCharCode)
        return interpolatedCharCode
      })
      interpolated = String.fromCharCode(...interpolatedCharCodes)
    } else if (oneValue instanceof Color) {
      // TODO: implement this, likely based on some sort of La*b* space
    }

    return interpolated
  }
}

// TODO: remove this after debugging
window.Keyframe = Keyframe

export default Keyframe
