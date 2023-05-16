import { observeListOfProperties } from '../../utility/state'
import Color from './Color'

class Colorable {
  static takeColorOrMakeColor(value) {
    if (value instanceof Color) {
      return value
    }
    return new Color(value)
  }

  constructor(color) {
    this._color = Colorable.takeColorOrMakeColor(color)

    this._observables = ['_color']
    this._nestedObservables = ['_color']
    observeListOfProperties(this, this.observables)
  }

  get observables() { return this._observables }
  get nestedObservables() { return this._nestedObservables }

  get color() { return this._color }
  set color(value) {
    this._color = Colorable.takeColorOrMakeColor(value)
  }

  get opacity() { return this.color.alpha }
  set opacity(value) {
    this._color.alpha = value
  }
}

export default Colorable
