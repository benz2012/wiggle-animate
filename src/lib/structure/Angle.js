import { makeObservable, observable, computed } from 'mobx'
import { truncateFloatLeaveInt } from '../../utility/numbers'

class Angle {
  static get className() { return 'Angle' }

  static deg2Rad(degrees) {
    return truncateFloatLeaveInt(degrees * (Math.PI / 180))
  }

  static rad2Deg(radians) {
    return truncateFloatLeaveInt(radians * (180 / Math.PI))
  }

  constructor(degrees = 0) {
    this.degrees = truncateFloatLeaveInt(degrees)

    makeObservable(this, {
      degrees: observable,
      radians: computed,
    })
  }

  get radians() { return Angle.deg2Rad(this.degrees) }
  set radians(value) {
    this.degrees = Angle.rad2Deg(value)
  }

  toString() {
    return `Angle(${this.degrees})`
  }
}

// TODO: remove this after debugging
window.Angle = Angle

export default Angle
