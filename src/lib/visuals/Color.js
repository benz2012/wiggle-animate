import { observeListOfProperties } from '../../utility/state'
import { rgbToLch, lchToRgb } from '../../utility/color'

class Color {
  static get className() { return 'Color' }

  static randomPastel() {
    return new Color({
      h: Math.floor(Math.random() * 361),
      s: 70,
      l: 70,
    })
  }

  static convertHSLToRGB = (h, s, l) => {
    const hue = h
    const saturation = s / 100
    const lightness = l / 100
    const a = saturation * Math.min(lightness, 1 - lightness)
    const k = (val) => (val + hue / 30) % 12
    const f = (val) => (
      lightness - a * Math.max(-1, Math.min(k(val) - 3, Math.min(9 - k(val), 1)))
    )
    const rgb = [255 * f(0), 255 * f(8), 255 * f(4)].map((val) => Math.round(val))
    return rgb
  }

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
    } else if (['h', 's', 'l'].every((prop) => (prop in inputSpec))) {
      this.colorString = null
      const { h, s, l, a } = inputSpec
      const [r, g, b] = Color.convertHSLToRGB(h, s, l)
      this.red = r
      this.green = g
      this.blue = b
      if (a != null) {
        this.alpha = a
      }
    }

    ['red', 'green', 'blue'].forEach((propName) => {
      if (this[propName] > 255) {
        this[propName] = 255
      } else if (this[propName] < 0) {
        this[propName] = 0
      }
    })

    observeListOfProperties(this, ['colorString', 'red', 'green', 'blue', 'alpha'])
  }

  get spec() {
    return ({ r: this.red, g: this.green, b: this.blue })
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
}

// TODO: remove this after debugging
window.Color = Color

export default Color
