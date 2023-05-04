import { v4 as uuidv4 } from 'uuid'

import { observeListOfProperties } from '../utility/state'

class Item {
  // This will be populated by the first instiated Container which will extend Item
  static rootContainer = null

  constructor(name = '') {
    this._id = uuidv4()
    this.name = name

    this._observables = ['name']
    this._nestedObservables = []
    observeListOfProperties(this, this.observables)
  }

  get id() { return this._id }
  get observables() { return this._observables }
  get nestedObservables() { return this._nestedObservables }

  delete() {
    Item.rootContainer.searchAndDelete(this._id)
  }
}

export default Item
