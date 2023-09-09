import { makeObservable, observable, action } from 'mobx'

import Keyframe from '../animation/Keyframe'

class Property {
  static get PRIMITIVES() {
    return { STRING: 'String', FLOAT: 'Float', INTEGER: 'Integer', BOOLEAN: 'Boolean' }
  }

  constructor({
    type: Type,
    value = null,
    label = null,
    group = null,
    order = 0,
    isEditable = false,
    isKeyframable = false,
  } = {}) {
    if (Type == null) throw new Error('Property.type must not be undefined')

    this.isPrimitive = Object.values(Property.PRIMITIVES).includes(Type)
    this.typeName = this.isPrimitive ? Type : Type.name
    this.type = Type // when primitive, this will be a string, so don't use it in that case
    this.label = label
    this.group = group
    this.order = order

    // Set initial value plainly or instantiate with null, arg, or ...args
    const castedValue = this.castValue(value)
    this._setObservableValue(castedValue)

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

  castValue(value) {
    if (this.isPrimitive) { return value }
    if (value instanceof this.type) { return value }

    const Type = this.type
    if (Array.isArray(value)) {
      return new Type(...value)
    }
    if (value != null) {
      return new Type(value)
    }
    return new Type()
  }

  get value() { return this._value }

  // We don't use a setter for this because it complicates the observation chain
  // when complex property types are used. This also allows for additional logic
  // within the setter without makeing JS "assignment" confusing (aka using `=`)
  setValue(newValue, when = 1) {
    const castedValue = this.castValue(newValue)
    const hasAnyKeyframes = this.keyframes?.length > 0

    if (!hasAnyKeyframes) {
      this._setObservableValue(castedValue)
    } else {
      const existingKeyframe = this.keyframes.find((keyframe) => (keyframe.frame === when))
      if (existingKeyframe) {
        existingKeyframe.value = castedValue
      } else {
        this.addKey(when, castedValue)
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
