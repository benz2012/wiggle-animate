import { makeObservable, action } from 'mobx'

import Item from '../structure/Item'
import Keyframe from '../animation/Keyframe'

class Animatable extends Item {
  constructor() {
    super()
    // All keyframable properties should be statically defined within the constructor
    // within each inherited child
    this.keyframes = {}

    makeObservable(this, { addKey: action })
  }

  addKey(property, frame, value) {
    const k = new Keyframe(frame, value)
    this.keyframes[property].push(k)
    this.keyframes[property].sort(Keyframe.sort)
    return k
  }

  valueForFrame(frame, property) {
    // TODO: sort keys on add instead of
    const keyframes = [...this.keyframes[property]].sort(Keyframe.sort)
    if (keyframes.length === 0) {
      // We support unnested & singly-nested properties
      // If we want deeper path support, we should make this function more robust
      if (property.includes('.')) {
        const [parentProp, childProp] = property.split('.')
        return this[parentProp][childProp]
      }
      return this[property]
    }

    const frames = keyframes.map((key) => (key.frame))

    // is frame a keyframe
    if (frames.includes(frame)) {
      const where = frames.indexOf(frame)
      return keyframes[where].value
    }

    // where is frame with respect to keyframes
    frames.push(frame)
    frames.sort((a, b) => a - b)
    const where = frames.indexOf(frame)

    // is frame before or after last key
    if (where === 0) return keyframes[0].value
    if (where === frames.length - 1) return keyframes[keyframes.length - 1].value

    // frame is between two keys
    const before = keyframes[where - 1]
    const after = keyframes[where]
    return Keyframe.interpolate(before, after, frame)
  }
}

export default Animatable
