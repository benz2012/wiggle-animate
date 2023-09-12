import { makeObservable, observable, action } from 'mobx'

import Keyframe from '../animation/Keyframe'
import { truncateFloatLeaveInt } from '../../utility/numbers'
import Vector2 from './Vector2'
import Selection from './Selection'

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
    valueDragRatio = 1,

    // Keyframe Attributes
    isKeyframable = false,
  } = {}) {
    if (Type == null) throw new Error('Property.type must not be undefined')

    this.isPrimitive = Object.values(Property.PRIMITIVES).includes(Type)
    this.typeName = this.isPrimitive ? Type : Type.className
    this.type = Type // when primitive, this will be a string, so don't use it in that case

    this.isEditable = isEditable
    this.name = null // this will be set when first accessed
    this.label = label // this will be set when first accessed, if not defined already
    this.group = group
    this.order = order
    this.minValue = minValue
    this.maxValue = maxValue
    this.valueDragRatio = valueDragRatio

    this.isKeyframable = isKeyframable
    this.keyframes = null
    if (isKeyframable) {
      this.keyframes = observable([])
    }

    // Set initial value plainly or instantiate with null, arg, or ...args
    const castedValue = this.castAndCoerceValue(value)
    this._setObservableValue(castedValue)

    makeObservable(this, {
      _value: observable,
      isEditable: observable,
      isKeyframable: observable,
      setValue: action,
      addKey: action,
    })
  }

  get value() { return this._value }

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
      const cappedValue = value.map((element) => {
        if ([Vector2.className].includes(this.typeName)) {
          if (this.maxValue != null && element > this.maxValue) {
            return this.maxValue
          }
          if (this.minValue != null && element < this.minValue) {
            return this.minValue
          }
        }
        return element
      })
      return new Type(...cappedValue)
    }

    if (value != null) {
      let cappedValue = value

      if ([Vector2.className].includes(this.typeName)) {
        if (this.maxValue != null && value > this.maxValue) {
          cappedValue = this.maxValue
        }
        if (this.minValue != null && value < this.minValue) {
          cappedValue = this.minValue
        }
      }

      if ([Selection.className].includes(this.typeName)) {
        this.value.selected = value
        return this.value
      }

      return new Type(cappedValue)
    }

    return new Type()
  }

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
