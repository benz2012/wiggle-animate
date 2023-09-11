import { makeObservable, observable, action } from 'mobx'

import Keyframe from '../animation/Keyframe'
import { truncateFloatLeaveInt } from '../../utility/numbers'

class Property {
  static get className() { return 'Property' }
  static get PRIMITIVES() {
    return { STRING: 'String', FLOAT: 'Float', INTEGER: 'Integer', BOOLEAN: 'Boolean' }
  }

  constructor({
    type: Type,
    value = null,

    // Editor Attributes
    isEditable = false,
    label = null,
    group = null,
    order = 0,
    minValue = null, // only applies to primitive float and int
    maxValue = null, // only applies to primitive float and int

    // Keyframe Attributes
    isKeyframable = false,
  } = {}) {
    if (Type == null) throw new Error('Property.type must not be undefined')

    this.isPrimitive = Object.values(Property.PRIMITIVES).includes(Type)
    this.typeName = this.isPrimitive ? Type : Type.className
    this.type = Type // when primitive, this will be a string, so don't use it in that case
    this.label = label
    this.group = group
    this.order = order
    this.minValue = minValue
    this.maxValue = maxValue

    // Set initial value plainly or instantiate with null, arg, or ...args
    const castedValue = this.castAndCoerceValue(value)
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

  /* This method casts the incoming value to the type that it should
   * have as declarted during Property Instantiation. It also coerces
   * values to be slightly different based on system design and
   * validation rules.
   */
  castAndCoerceValue(value) {
    if (this.isPrimitive) {
      if ([Property.PRIMITIVES.FLOAT, Property.PRIMITIVES.INTEGER].includes(this.typeName)) {
        const truncatedValue = truncateFloatLeaveInt(value)
        if (this.maxValue != null && truncatedValue > this.maxValue) {
          return this.maxValue
        }
        if (this.minValue != null && truncatedValue < this.minValue) {
          return this.minValue
        }
        return truncatedValue
      }
      return value
    }

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
    const castedValue = this.castAndCoerceValue(newValue)
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
