import { observable, action } from 'mobx'
import paper from 'paper'

import Keyframe from './Keyframe'

class AnimatableItem {
  // Canvas Size Relative Values (0-100)
  static get X() { return 50 }
  static get Y() { return 50 }

  // Absolute Values
  static get SCALE() { return 100 }
  static get ROTATION() { return 0 }
  static get FILL_COLOR() {
    return {
      hue: Math.floor(Math.random() * 361),
      saturation: 0.4,
      brightness: 1,
    }
  }

  static get OBSERVABLES() {
    return ['x', 'y', 'scale', 'rotation', 'fillColor', 'keyframes']
  }

  constructor({ key }) {
    this.key = key
  }

  @observable canvas
  @observable _x = AnimatableItem.X
  @observable _y = AnimatableItem.Y
  @observable _scale = AnimatableItem.SCALE
  @observable _rotation = AnimatableItem.ROTATION
  @observable _fillColor = AnimatableItem.FILL_COLOR
  @observable keyframes = {
    x: observable([]),
    y: observable([]),
    scale: observable([]),
    rotation: observable([]),
  }

  toJSON() {
    return ({
      class: this.constructor.name,
      x: this.x,
      y: this.y,
      scale: this.scale,
      rotation: this.rotation,
      fillColor: this.fillColor,
      keyframes: Object.entries(this.keyframes).reduce(
        (output, [prop, keyframeList]) => {
          /* eslint no-param-reassign: 0 */
          output[prop] = keyframeList.map(keyframe => keyframe.toJSON())
          return output
        }, {}
      ),
    })
  }

  get item() { return paper.project.activeLayer.children[this.key] }
  get x() { return this._x }
  get y() { return this._y }
  get position() { return { x: this.x, y: this.y } }
  get scale() { return this._scale }
  get rotation() { return this._rotation }
  get fillColor() { return this._fillColor }

  set x(value) {
    this.item.position.x = this.absolute(value)
    this._x = value
  }

  set y(value) {
    this.item.position.y = this.absolute(value, 'height')
    this._y = value
  }

  set position({ x, y }) {
    this.x = x
    this.y = y
  }

  set scale(value) {
    if (this.scale === 0 && value !== 0) {
      this.item.remove()
      this.create(this.canvas)
      this.item.scale(this.fraction(value))
    } else {
      const scaleBy = value / this.scale
      this.item.scale(scaleBy)
    }
    this._scale = value
  }

  set rotation(value) {
    const rotateBy = value - this.rotation
    this.item.rotate(rotateBy)
    this._rotation = value
  }

  set fillColor(value) {
    this.item.fillColor = value
    this._fillColor = value
  }

  @action setCanvas(canvas) {
    this.canvas = canvas
  }

  @action setUntrackedValues() {
    this.item.scale(this.fraction(this.scale))
    this.item.rotate(this.rotation)
  }

  @action updateKeyframes(property, keyframes) {
    this.keyframes = {
      ...this.keyframes,
      [property]: keyframes,
    }
  }

  addKey(property, frame, value = undefined, ignorePairings = false) {
    const valueToKey = value || this[property]
    const k = new Keyframe(frame, valueToKey)
    const keyframes = [...this.keyframes[property], k]
    keyframes.sort(Keyframe.sort)

    if (!ignorePairings) {
      let paired
      if (property === 'x') { paired = 'y' }
      if (property === 'y') { paired = 'x' }

      const valueToPair = this[paired]
      const kP = new Keyframe(frame, valueToPair)
      const keyframesPaired = [...this.keyframes[paired], kP]
      keyframesPaired.sort(Keyframe.sort)

      this.keyframes = {
        ...this.keyframes,
        [property]: keyframes,
        [paired]: keyframesPaired,
      }
    } else {
      this.updateKeyframes(property, keyframes)
    }

    return k
  }

  removeKey(property, frame) {
    let keyframes = [...this.keyframes[property]]
    keyframes = keyframes.filter(k => k.frame !== frame)

    if (property === 'x') {
      let keyframesY = [...this.keyframes.y]
      keyframesY = keyframesY.filter(k => k.frame !== frame)
      this.keyframes = {
        ...this.keyframes,
        x: keyframes,
        y: keyframesY,
      }
    } else {
      this.updateKeyframes(property, keyframes)
    }
  }

  absolute = (value, dimension = 'width') => (
    value / 100 * this.canvas[dimension]
  )

  fraction = value => (
    value / 100
  )

  create(canvas) {
    if (this.canvas === undefined) this.setCanvas(canvas)

    const sharedProps = {
      name: this.key,
      fillColor: this.fillColor,
    }

    if (typeof this.onCreate === 'function') {
      this.onCreate(sharedProps)
    }

    if (this.item !== undefined) this.setUntrackedValues()
  }

  recreate() {
    this.item.remove()
    this.create(this.canvas)
    this.canvas.addListenersAndSelect(this)
  }

  draw(frame) {
    if (this.item === undefined) return

    Object.entries(this.keyframes).forEach(([property, keyframes]) => {
      // Ignore `y` property
      if (property === 'y') return
      if (property === 'x') {
        // Interpret `x` & `y` at the same time
        const xKeyframes = keyframes
        const yKeyframes = this.keyframes.y
        if (xKeyframes.length === 0 && yKeyframes.length === 0) return
        const xValue = this.valueForFrame(frame, xKeyframes)
        const yValue = this.valueForFrame(frame, yKeyframes)
        this.position = { x: xValue, y: yValue }
      } else {
        // Interpret all other properties individually
        if (keyframes.length === 0) return
        const value = this.valueForFrame(frame, keyframes)
        this[property] = value
      }
    })
  }

  valueForFrame = (frame, keyframes) => {
    const frames = keyframes.map(key => key.frame)

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

export default AnimatableItem
