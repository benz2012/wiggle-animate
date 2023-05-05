import { v4 as uuidv4 } from 'uuid'

import names from '../assets/names.json'
import { observeListOfProperties } from '../utility/state'
import { randomChoice } from '../utility/array'

class Item {
  // This will be populated by the first instiated Container which will extend Item
  static rootContainer = null

  constructor() {
    this._id = uuidv4()
    this.name = randomChoice(names)

    this._observables = ['name']
    this._nestedObservables = []
    observeListOfProperties(this, this.observables)
  }

  get id() { return this._id }
  get observables() { return this._observables }
  get nestedObservables() { return this._nestedObservables }

  delete() {
    Item.rootContainer.findAndDelete(this._id)
  }
}

export default Item
