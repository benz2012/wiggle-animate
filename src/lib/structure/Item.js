import { v4 as uuidv4 } from 'uuid'

import Property from './Property'
import names from '../../assets/names.json'
import { randomChoice } from '../../utility/array'

class Item {
  // This will be populated by the first instiated Container which will extend Item
  static rootContainer = null

  constructor() {
    this._id = uuidv4()
    this._name = new Property({
      type: Property.PRIMITIVES.STRING,
      value: randomChoice(names),
      isEditable: true,
    })

    // TODO: Is this a problem because this.DPR can change during the life of the app??!?
    this.DPR = window.devicePixelRatio || 1
  }

  get id() { return this._id }
  get name() { return this._name }

  get properties() {
    /* eslint-disable no-restricted-syntax */
    const properties = []
    for (const propertyName in this) {
      if (Object.hasOwn(this, propertyName)) {
        const propertyValue = this[propertyName]
        if (propertyValue instanceof Property) {
          properties.push(propertyName)
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

  delete() {
    Item.rootContainer.findAndDelete(this._id)
  }
}

export default Item
