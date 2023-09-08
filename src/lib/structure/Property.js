import { makeObservable, observable, action } from 'mobx'

import Keyframe from '../animation/Keyframe'

class Property {
  static get PRIMITIVES() {
    return { STRING: 'String', FLOAT: 'Float', INTEGER: 'integer', BOOLEAN: 'Boolean' }
  }

  constructor({
    type: Type,
    value = null,
    isEditable = false,
    isKeyframable = false,
  } = {}) {
    if (Type == null) throw new Error('Property.type must not be undefined')

    this.isPrimitive = Object.values(Property.PRIMITIVES).includes(Type)
    this.type = this.isPrimitive ? Type : Type.name

    // Set initial value plainly or instantiate with null, arg, or ...args
    if (this.isPrimitive) {
      this._value = value
    } else if (Array.isArray(value)) {
      this._value = new Type(...value)
    } else if (value != null) {
      this._value = new Type(value)
    } else {
      this._value = new Type()
    }
    // if (!this.isPrimitive && !('observables' in this._value)) {
    //   throw new Error(`Property value of type ${this.type} must have an observables array`)
    // }
    makeObservable(this, {
      _value: observable,
      setValue: action,
      addKey: action,
    })

    this.isEditable = isEditable

    this.isKeyframable = isKeyframable
    this.keyframes = null
    if (isKeyframable) {
      this.keyframes = observable([])
    }
  }

  get value() { return this._value }

  // We don't use a setter for this because it complicates the observation chain
  // when complex property types are used. This also allows for additional logic
  // within the setter without makeing JS "assignment" confusing (aka using `=`)
  setValue(newValue, when = 1) {
    const hasAnyKeyframes = this.keyframes?.length > 0

    if (!hasAnyKeyframes) {
      this._setObservableValue(newValue)
    } else {
      const existingKeyframe = this.keyframes.find((keyframe) => (keyframe.frame === when))
      if (existingKeyframe) {
        existingKeyframe.value = newValue
      } else {
        this.addKey(when, newValue)
      }
    }
  }

  // This function is needed so that we can directly trigger canvas drawing
  // by changing the observable peice of this object. Externally you should
  // always call setValue since it will handle Keyframing logic. We do call
  // this one time externally, within updatePropertiesForFrame
  _setObservableValue(newValue) {
    this._value = newValue
  }

  addKey(frame, value) {
    const k = new Keyframe(frame, value)
    this.keyframes.push(k)
    return k
  }

  // Casting a property to a string will allow nested observation.
  // Sub-values of complex classes can implement toString as well
  toString() { return `${this._value}` }
}

export default Property
