import { makeObservable, action } from 'mobx'

import { observeListOfProperties } from '../../utility/state'
import { browserFonts, weightLabelMap } from '../../utility/fonts'

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
    makeObservable(this, { setNewValues: action })
  }

  get values() {
    if (this.specialType === '_fontFamily') {
      return this.store.fontFamilies
    }
    return this._values
  }

  setNewValues(newValues, selected) {
    this._values = newValues
    this.selected = selected
  }

  attatchStore(specialType, storeRef) {
    this.specialType = specialType
    this.store = storeRef
    if (this.specialType === '_fontFamily') {
      this.selected = 'Sans-Serif'
    } else if (this.specialType === '_fontStyle') {
      this._values = ['normal', 'italic']
      this.selected = 'normal'
    } else if (this.specialType === '_fontWeight') {
      this._values = browserFonts
        .filter((font) => font.name === 'Sans-Serif')
        .map((font) => weightLabelMap[font.weight])
      this.selected = '400 - Normal'
    }
  }

  toString() {
    return `Selection(${this.selected})`
  }
}

export default Selection
