import { v4 as uuidv4 } from 'uuid'

import Property from './Property'
import names from '../../assets/names.json'
import { randomChoice } from '../../utility/array'

class Item {
  static get className() { return 'Item' }

  // This will be populated by the first instiated Container which will extend Item
  static rootContainer = null

  constructor() {
    this._id = uuidv4()
    this._name = new Property({
      type: Property.PRIMITIVES.STRING,
      value: randomChoice(names),
      isEditable: true,
    })

    // TODO [4]: Is this a problem because this.DPR can change during the life of the app??!?
    this.DPR = window.devicePixelRatio || 1
  }

  get id() { return this._id }
  get name() { return this._name.value }

  get properties() {
    /* eslint-disable no-restricted-syntax */
    const properties = []
    for (const propertyName in this) {
      if (Object.hasOwn(this, propertyName)) {
        const propertyValue = this[propertyName]
        if (propertyValue instanceof Property) {
          properties.push(propertyName)

          // Since Property has no way of know it's own name, we will cache it's name
          // inside of itself on the `label` attribute. This is somewhat hacky since
          // it's imperitive, and lives outside of the Property class, but prevents
          // us from having to declare a label unnecessarily. Property.label will then
          // never be null/undefined after this point. We also cache the raw name
          // to enable us to know things about sibling properties.
          if (propertyValue.name == null) {
            propertyValue.name = propertyName
          }
          if (propertyValue.label == null) {
            propertyValue.label = propertyName.startsWith('_') ? propertyName.slice(1) : propertyName
          }
        }
      }
    }
    return properties
  }

  get observables() {
    return this.properties
  }

  get editables() {
    return this.properties.filter((propertyName) => this[propertyName].isEditable)
  }

  get keyframables() {
    return this.properties.filter((propertyName) => this[propertyName].isKeyframable)
  }

  updatePropertiesForFrame(frame) {
    this.keyframables.forEach((propertyName) => {
      const newValue = this[propertyName].getValueAtFrame(frame)
      this[propertyName]._setObservableValue(newValue)
    })
  }

  // NOTE: This requires all Property Custom Types to be Base Classes,
  //       otherwise we need deeper cloning
  duplicate() {
    const parent = Item.rootContainer.findParent(this.id)
    const thisSortIndex = parent.sortOrder.findIndex((childId) => childId === this.id)
    const copyOfSelf = new this.constructor()

    // Since `new this.constructor()` instantiantes all brand new properties on the item,
    // there is no need to re-instantiate each property "type" to avoid sharing pointers.
    this.properties.forEach((propertyName) => {
      const property = this[propertyName]
      if (property.isPrimitive) {
        copyOfSelf[propertyName].setValue(property.value)
      } else {
        const propertyObj = property.value.toPureObject()
        Object.entries(propertyObj).forEach(([subPropName, subPropValue]) => {
          if (subPropName === 'className') return
          copyOfSelf[propertyName].value[subPropName] = subPropValue
        })
      }

      if (property.keyframes == null) return
      property.keyframes.forEach((keyframe) => {
        const copyOfKeyframe = keyframe.constructor.fromPureObject(keyframe.toPureObject())
        copyOfSelf[propertyName].keyframes.push(copyOfKeyframe)
      })
    })

    // Increment Name for clarity
    const numeralFound = this.name.match(/(.+\s)(\d+)/)
    if (numeralFound) {
      const [_, namePrefix, numStr] = numeralFound
      const incremented = parseInt(numStr, 10) + 1
      copyOfSelf._name.setValue(`${namePrefix}${incremented}`)
    } else {
      copyOfSelf._name.setValue(`${copyOfSelf.name} 2`)
    }

    parent.add(copyOfSelf, thisSortIndex - 1, false)
  }

  delete() {
    Item.rootContainer.findAndDelete(this._id)
  }
}

export default Item
