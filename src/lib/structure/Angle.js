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

  static vectorUnitCircleAngle = (vectorX, vectorY) => {
    let radians = 0
    if (vectorX || vectorY) {
      radians = Math.atan2(vectorY, vectorX)
      if (radians < 0) {
        radians += 2 * Math.PI
      }
    }

    const angle = new Angle()
    angle.radians = radians
    return angle
  }

  static vectorOctant = (vectorX, vectorY) => {
    const { degrees } = Angle.vectorUnitCircleAngle(vectorX, vectorY)

    const eighth = 360 / 8
    const sixteenth = 360 / 16
    if (degrees > eighth * 0 - sixteenth && degrees <= eighth * 0 + sixteenth) return 0
    if (degrees > eighth * 1 - sixteenth && degrees <= eighth * 1 + sixteenth) return 1
    if (degrees > eighth * 2 - sixteenth && degrees <= eighth * 2 + sixteenth) return 2
    if (degrees > eighth * 3 - sixteenth && degrees <= eighth * 3 + sixteenth) return 3
    if (degrees > eighth * 4 - sixteenth && degrees <= eighth * 4 + sixteenth) return 4
    if (degrees > eighth * 5 - sixteenth && degrees <= eighth * 5 + sixteenth) return 5
    if (degrees > eighth * 6 - sixteenth && degrees <= eighth * 6 + sixteenth) return 6
    if (degrees > eighth * 7 - sixteenth && degrees <= eighth * 7 + sixteenth) return 7
    return 0
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

  toShortString() {
    return `${this.degrees}°`
  }
}

// TODO [-]: remove this after debugging
window.Angle = Angle

export default Angle
