import { observable } from 'mobx'

import Drawable from './Drawable'
import { observeListOfProperties } from '../utility/state'

class Animatable extends Drawable {
  constructor(...args) {
    super(...args)
    this.keyframes = {
      observables: [], // this might give us problems later
      position: observable([]),
      scale: observable([]),
      rotation: observable([]),
    }

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'keyframes']
    this._nestedObservables = [...super.nestedObservables, 'keyframes']
    observeListOfProperties(this, this.observables, inheritedObservables)
  }
}

export default Animatable
