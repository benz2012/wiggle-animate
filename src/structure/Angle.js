import { makeObservable, computed } from 'mobx'

import { observeListOfProperties } from '../utility/state'

class Angle {
  static deg2Rad(degrees) {
    return degrees * (Math.PI / 180)
  }

  constructor(degrees = 0) {
    this.degrees = degrees

    this.observables = ['degrees']
    observeListOfProperties(this, this.observables)
    makeObservable(this, { radians: computed })
  }

  get radians() { return Angle.deg2Rad(this.degrees) }
}

export default Angle
