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
  }

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
