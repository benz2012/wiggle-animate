import { observable } from 'mobx'

import Drawable from './Drawable'
import Keyframe from '../animation/Keyframe'

class Animatable extends Drawable {
  constructor(...args) {
    super(...args)
    this.keyframes = {
      // TODO: remove these defaults, allow manipulation, merge x&y into position
      x: observable([
        new Keyframe(1, Math.random() * 1920 + 100),
        new Keyframe(100, Math.random() * 1920 + 100),
      ]),
      y: observable([
        new Keyframe(1, Math.random() * 1080 + 100),
        new Keyframe(100, Math.random() * 1080 + 100),
      ]),
      scale: observable([]),
      rotation: observable([]),
    }
  }

  static valueForFrame = (frame, keyframes) => {
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

  valueForFrame(frame, property) {
    return Animatable.valueForFrame(frame, this.keyframes[property])
  }
}

export default Animatable
