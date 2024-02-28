import { v4 as uuidv4 } from 'uuid'

import Property from './Property'
import names from '../../assets/names.json'
import { randomChoice } from '../../utility/array'

let testingIncremetor = 0
const namesWithStatic0thName = ['test-root-container', 'test-name', ...names]

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

    if (process.env.REACT_APP_TEST_ENV === 'true') {
      const staticName = namesWithStatic0thName[testingIncremetor]
      console.log(testingIncremetor, staticName, namesWithStatic0thName.slice(0, 3))
      this._name.setValue(staticName)
      testingIncremetor += 1
    }

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
            if (propertyName.startsWith('_') === false) {
              throw new Error(
                'We expect the developer to always use an underscore prefix for instance properties'
                + ' that are of type Property -- e.g. this._scale = new Property({ ... })'
                + ` For: ${this.constructor.className}.${propertyName}`
              )
            }
            propertyValue.label = propertyName.slice(1)
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

  delete() {
    Item.rootContainer.findAndDelete(this._id)
  }

  toPureObject() {
    const finalPureObject = this.properties.reduce((ownPureObject, propertyName) => {
      /* eslint-disable no-param-reassign */
      const keyName = propertyName.slice(1)
      ownPureObject[keyName] = this[propertyName].toPureObject()
      return ownPureObject
    }, {})
    finalPureObject.className = this.constructor.className
    finalPureObject.id = this.id
    return finalPureObject
  }

  fromPureObject(pureObject, preserveId = true) {
    if (preserveId) {
      this._id = pureObject.id
    }
    Object.entries(pureObject).forEach((entry) => {
      const [keyName, propertyObj] = entry
      if (['id', 'className'].includes(keyName)) return

      const propertyName = `_${keyName}`
      const property = this[propertyName]
      property.fromPureObject(propertyObj, preserveId)
    })
    return this
  }
}

export default Item
