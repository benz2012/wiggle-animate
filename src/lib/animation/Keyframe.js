import { v4 as uuidv4 } from 'uuid'

import Handle from './Handle'
import bezierApproximation from './Bezier'
import Vector2 from '../structure/Vector2'
import Angle from '../structure/Angle'
import Color from '../visuals/Color'
import { observeListOfProperties } from '../../utility/state'
import { isObject, isPrimitive } from '../../utility/object'
import { isString, START_OF_NORMAL_CHARS, END_OF_NORMAL_CHARS } from '../../utility/string'
import propertyValueTypeMap from '../structure/propertyValueTypeMap'

class Keyframe {
  static get className() { return 'Keyframe' }
  static curveCache = {}

  constructor(frame, value) {
    this._id = uuidv4()
    this.frame = frame
    this.value = value
    this.handleIn = new Handle(Handle.TYPES.IN)
    this.handleOut = new Handle(Handle.TYPES.OUT)

    observeListOfProperties(this, ['frame', 'value'])
  }

  get id() { return this._id }

  static sort = (a, b) => (a.frame - b.frame)
  static reverseSort = (a, b) => (b.frame - a.frame)

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
    // Check from highest-complexity class-type to lowest (eg. Vector2 before Obj.x&y)
    const oneValue = k1.value
    let interpolated = k1.value
    if (oneValue instanceof Vector2) {
      interpolated = new Vector2(
        ((k2.value.x - k1.value.x) * valueRatio) + k1.value.x,
        ((k2.value.y - k1.value.y) * valueRatio) + k1.value.y,
      )
    } else if (oneValue instanceof Color) {
      const k1RGB = k1.value.spec
      const k2RGB = k2.value.spec
      interpolated = new Color({
        r: ((k2RGB.r - k1RGB.r) * valueRatio) + k1RGB.r,
        g: ((k2RGB.g - k1RGB.g) * valueRatio) + k1RGB.g,
        b: ((k2RGB.b - k1RGB.b) * valueRatio) + k1RGB.b,
      })
    } else if (oneValue instanceof Angle) {
      interpolated = new Angle(
        ((k2.value.degrees - k1.value.degrees) * valueRatio) + k1.value.degrees
      )
    } else if (isObject(oneValue) && 'x' in oneValue && 'y' in oneValue) {
      interpolated = {
        x: ((k2.value.x - k1.value.x) * valueRatio) + k1.value.x,
        y: ((k2.value.y - k1.value.y) * valueRatio) + k1.value.y,
      }
    } else if (Number.isFinite(oneValue)) {
      interpolated = ((k2.value - k1.value) * valueRatio) + k1.value
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
    }

    return interpolated
  }

  toString() {
    return `${Keyframe.className}(${this.frame}, ${this.value}, ${this.handleIn}, ${this.handleOut})`
  }

  toPureObject() {
    const value = isPrimitive(this.value) ? this.value : this.value.toPureObject()
    return {
      frame: this.frame,
      value,
      handleIn: this.handleIn.toPureObject(),
      handleOut: this.handleOut.toPureObject(),
    }
  }

  static fromPureObject({ frame, value: pureValue, handleIn, handleOut }) {
    let newKeyframeValue = pureValue
    if (isObject(pureValue)) {
      const KeyframeValueType = propertyValueTypeMap[pureValue.className]
      newKeyframeValue = KeyframeValueType.fromPureObject(pureValue)
    }

    const newKey = new Keyframe(frame, newKeyframeValue)
    newKey.handleIn.influence = handleIn.influence
    newKey.handleIn.distance = handleIn.distance
    newKey.handleOut.influence = handleOut.influence
    newKey.handleOut.distance = handleOut.distance
    return newKey
  }
}

export default Keyframe
