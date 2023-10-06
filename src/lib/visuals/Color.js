import { observeListOfProperties } from '../../utility/state'
import { rgbToLch, lchToRgb, rgbToHsl, hslToRgb } from '../../utility/color'

class Color {
  static get className() { return 'Color' }

  static recentPastelHues = []
  static randomPastel() {
    const nearbyThreshold = 15
    const newRandomHue = Math.floor(Math.random() * 361)
    let isNewHueNearAnyRecentHues = Color.recentPastelHues.some((recentHue) => (
      Math.abs(newRandomHue - recentHue) < nearbyThreshold
    ))
    if (
      !isNewHueNearAnyRecentHues
      && (newRandomHue < nearbyThreshold || newRandomHue > 360 - nearbyThreshold)
      && Color.recentPastelHues.some((recentHue) => (
        recentHue < nearbyThreshold || recentHue > 360 - nearbyThreshold
      ))
    ) {
      isNewHueNearAnyRecentHues = true
    }
    if (isNewHueNearAnyRecentHues) {
      return Color.randomPastel()
    }

    Color.recentPastelHues.push(newRandomHue)
    if (Color.recentPastelHues.length > 3) {
      Color.recentPastelHues.shift()
    }
    return Color.fromHSL({
      h: newRandomHue,
      s: 70,
      l: 70,
    })
  }

  static fromHSL = (hslSpec) => (
    new Color(hslToRgb(hslSpec))
  )

  static fromLCH = (lchSpec) => (
    new Color(lchToRgb(lchSpec))
  )

  constructor(inputSpec, ...rest) {
    this.colorString = null
    this.red = 0
    this.green = 0
    this.blue = 0
    this.alpha = 1

    if (rest.length > 0) {
      // eslint-disable-next-line no-param-reassign
      inputSpec = [inputSpec, ...rest]
    }

    if (typeof inputSpec === 'string') {
      // this assumes it's a named css color, eg. red or transparent
      this.colorString = inputSpec
      if (inputSpec === 'transparent') {
        this.alpha = 0
      }
    } else if (Array.isArray(inputSpec)) {
      this.red = inputSpec[0]
      this.green = inputSpec[1]
      this.blue = inputSpec[2]
      if (inputSpec.length === 4) {
        this.alpha = inputSpec[3]
      }
    } else if (['r', 'g', 'b'].every((prop) => (prop in inputSpec))) {
      this.colorString = null
      const { r, g, b, a } = inputSpec
      this.red = r
      this.green = g
      this.blue = b
      if (a != null) {
        this.alpha = a
      }
    }

    // Capp values between 0 & 255, or force it to be an int
    ['red', 'green', 'blue'].forEach((propName) => {
      if (this[propName] > 255) {
        this[propName] = 255
      } else if (this[propName] < 0) {
        this[propName] = 0
      } else {
        this[propName] = parseInt(this[propName], 10)
      }
    })

    observeListOfProperties(this, ['colorString', 'red', 'green', 'blue', 'alpha'])
  }

  get spec() {
    return ({ r: this.red, g: this.green, b: this.blue })
  }

  toHSL() {
    return rgbToHsl(this.spec)
  }

  toLCH() {
    return rgbToLch(this.spec)
  }

  toString() {
    if (this.colorString != null) {
      return this.colorString
    }
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`
  }

  toStringExternalAlpha(alpha) {
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${alpha})`
  }

  toShortString() {
    return `${this.red}, ${this.green}, ${this.blue}`
  }
}

// TODO [-]: remove this after debugging
window.Color = Color

export default Color
