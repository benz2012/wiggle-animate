import { makeObservable, observable, computed } from 'mobx'

class Angle {
  static deg2Rad(degrees) {
    return degrees * (Math.PI / 180)
  }

  static rad2Deg(radians) {
    return radians * (180 / Math.PI)
  }

  constructor(degrees = 0) {
    this.degrees = degrees

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

export default Angle
