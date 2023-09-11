import Item from '../structure/Item'
import Keyframe from '../animation/Keyframe'

class Animatable extends Item {
  static get className() { return 'Animatable' }

  get keyframables() {
    return this.properties.filter((propertyName) => this[propertyName].isKeyframable)
  }

  valueForFrame(frame, property) {
    // Keyframes should be sorted here since their order in the array won't always
    // represent what frame they fall on. E.g. When you slide a keyframe in the timeline
    const keyframes = [...this[property].keyframes].sort(Keyframe.sort)

    if (keyframes.length === 0) {
      return this[property].value
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

  updatePropertiesForFrame(frame) {
    this.keyframables.forEach((propertyName) => {
      const newValue = this.valueForFrame(frame, propertyName)
      this[propertyName]._setObservableValue(newValue)
    })
  }
}

export default Animatable
