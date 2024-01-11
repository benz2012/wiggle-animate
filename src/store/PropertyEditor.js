import { makeAutoObservable } from 'mobx'

import Vector2 from '../lib/structure/Vector2'

class PropertyEditor {
  static get INITIAL() {
    return {
      position: new Vector2(16, 42 + 16 + 8),
      hiddenGroups: {},
      pairedVectors: {},
    }
  }

  constructor() {
    this.position = PropertyEditor.INITIAL.position
    this.hiddenGroups = PropertyEditor.INITIAL.hiddenGroups
    this.pairedVectors = PropertyEditor.INITIAL.pairedVectors

    makeAutoObservable(this)
  }

  setPosition(value) {
    this.position.x = value.x
    this.position.y = value.y
  }

  hideGroup(groupName) {
    this.hiddenGroups[groupName] = true
  }

  showGroup(groupName) {
    this.hiddenGroups[groupName] = false
  }

  setPairedVector(propertyKey, shouldPair) {
    this.pairedVectors[propertyKey] = shouldPair
  }
}

export default PropertyEditor
