import { observeListOfProperties } from '../../utility/state'

class Selection {
  static get className() { return 'Selection' }

  constructor(defaultSelectionIdx, ...values) {
    // This will be set as a reference when the Selection box has a special type
    // which will reference values from the store (eg. Font Selector)
    this.specialType = null
    this.store = null

    this._values = values
    this.selected = values[defaultSelectionIdx]

    observeListOfProperties(this, ['_values', 'selected'])
  }

  get values() {
    if (this.specialType === '_fontSelector') {
      return this.store.fontFamilies
    }
    return this._values
  }

  attatchStore(specialType, storeRef) {
    this.specialType = specialType
    this.store = storeRef
    if (!this.selected) {
      if (this.specialType === '_fontSelector') {
        this.selected = 'Sans-Serif'
      } else {
        this.selected = this.values[0]
      }
    }
  }

  toString() {
    return `Selection(${this.selected})`
  }
}

export default Selection
