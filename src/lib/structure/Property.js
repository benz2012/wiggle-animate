import { makeObservable, observable, action } from 'mobx'

import Vector2 from './Vector2'
import Selection from './Selection'
import propertyValueTypeMap from './propertyValueTypeMap'
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
    valueDragRatio = 1,
    defaultSelection = 0, // only applied to Selection-type

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
    this.defaultSelection = defaultSelection

    this.isKeyframable = isKeyframable
    this.keyframes = null
    if (isKeyframable) {
      this.keyframes = observable([])
    }

    // Set initial value plainly or instantiate with null, arg, or ...args
    const castedValue = this.castAndCoerceValue(value)
    this._setObservableValue(castedValue) // sets this._value

    makeObservable(this, {
      _value: observable,
      isEditable: observable,
      isKeyframable: observable,
      keyframes: observable,
      setValue: action,
      addKey: action,
      deleteKey: action,
    })
  }

  get value() { return this._value }

  getValueAtFrame(frame) {
    // prevent accidental call to non-keyframable property
    if (this.keyframes == null) return this.value

    // Keyframes should be sorted here since their order in the array won't always
    // represent what frame they fall on. E.g. When you slide a keyframe in the timeline
    const keyframes = [...this.keyframes].sort(Keyframe.sort)

    if (keyframes.length === 0) {
      return this.value
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

      if ([Selection.className].includes(this.typeName)) {
        if (cappedValue[0].startsWith('_font')) {
          const newObj = new Type()
          newObj.attatchStore(cappedValue[0], cappedValue[1])
          return newObj
        }
        return new Type(this.defaultSelection, ...cappedValue)
      }

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

  // We don't use a JS setter for this because it complicates the observation chain
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
        const newKeyframe = this.addKey(when, castedValue)
        // This will allow callers of setValue to respond to a new keyframe being created during a value change.
        // Most notably: adding an action to the actionStack to undo/redo the creation of this keyframe
        // Warning: Technically the castedValue attatched to the newKeyframe will be the first new value
        //          in a sequence of edits. This means that when re-doing the addKey action, it will appear to
        //          hold some weird value. This is not a bug, but rather a flaw in how we both create the newKeyframe
        //          and edit it's value all on the same tick. Theoretically we would want to make the newKeyframe
        //          without the new value, however, then the keyframe itself is "wrong", because the user has already
        //          completed the action of changing the underlying value. So there's not a clear solution to this flaw.
        return newKeyframe
      }
    }
    return null
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

    // Controversial: New keyframes should use similar curve params as the surrounding ones
    if (this.keyframes.length > 2) {
      const sortedKeyframes = [...this.keyframes].sort(Keyframe.sort)
      const addedKeyframedIdx = sortedKeyframes.findIndex((sk) => (sk.id === k.id))
      if (addedKeyframedIdx > 0) {
        const prevKeyframe = sortedKeyframes[addedKeyframedIdx - 1]
        k.handleOut.influence = prevKeyframe.handleOut.influence
        k.handleOut.distance = prevKeyframe.handleOut.distance
      }
      if (addedKeyframedIdx !== this.keyframes.length - 1) {
        const nextKeyframe = sortedKeyframes[addedKeyframedIdx + 1]
        k.handleIn.influence = nextKeyframe.handleIn.influence
        k.handleIn.distance = nextKeyframe.handleIn.distance
      }
    }

    return k
  }

  deleteKey(keyId) {
    this.keyframes = this.keyframes.filter((keyframe) => keyframe.id !== keyId)
  }

  // Casting a property to a string will allow nested observation.
  // Sub-values of complex classes can implement toString as well
  toString() { return `${this._value}` }

  toPureObject() {
    const finalPureObject = {}
    finalPureObject.value = this.isPrimitive ? this.value : this.value.toPureObject()
    if (this.keyframes !== null) {
      finalPureObject.keyframes = this.keyframes.map((keyframe) => keyframe.toPureObject())
    }
    return finalPureObject
  }

  fromPureObject({ value, keyframes }, preserveId = true) {
    if (this.isPrimitive) {
      this.setValue(value)
    } else if (value.className === Selection.className) {
      // This will help maintain custom linkages we establish during Selection instantiation
      this.value.fromPureObject(value)
    } else {
      const PropertyValueType = propertyValueTypeMap[value.className]
      const newPropertyValue = PropertyValueType.fromPureObject(value)
      this.setValue(newPropertyValue)
    }

    if (keyframes == null) return
    keyframes.forEach((keyframeObj) => {
      const newKeyframe = Keyframe.fromPureObject({ ...keyframeObj }, preserveId)
      this.keyframes.push(newKeyframe)
    })
  }
}

export default Property
