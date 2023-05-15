const rgbToHsl = (rgb) => {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h
  let s
  let l = (max + min) / 2

  if (max === min) {
    // achromatic
    h = 0
    s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        break
    }

    h /= 6
  }

  h *= 360
  s *= 100
  l *= 100

  return { h, s, l }
}

const hslToRgb = (hsl) => {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  let r
  let g
  let b

  if (s === 0) {
    // achromatic
    r = l
    g = l
    b = l
  } else {
    const hue2rgb = (p, q, initialT) => {
      let t = initialT
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  r *= 255
  g *= 255
  b *= 255

  return { r, g, b }
}

const rgbToXyz = (rgb) => {
  let r = rgb.r / 255
  let g = rgb.g / 255
  let b = rgb.b / 255

  if (r > 0.04045) {
    r = (((r + 0.055) / 1.055)) ** 2.4
  } else {
    r /= 12.92
  }

  if (g > 0.04045) {
    g = (((g + 0.055) / 1.055)) ** 2.4
  } else {
    g /= 12.92
  }

  if (b > 0.04045) {
    b = (((b + 0.055) / 1.055)) ** 2.4
  } else {
    b /= 12.92
  }

  r *= 100
  g *= 100
  b *= 100

  // Observer = 2°, Illuminant = D65
  const x = r * 0.4124 + g * 0.3576 + b * 0.1805
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505

  return { x, y, z }
}

const xyzToLab = (xyz) => {
  // Observer = 2°, Illuminant = D65
  let x = xyz.x / 95.047
  let y = xyz.y / 100.000
  let z = xyz.z / 108.883

  if (x > 0.008856) {
    x **= 0.333333333
  } else {
    x = 7.787 * x + 0.137931034
  }

  if (y > 0.008856) {
    y **= 0.333333333
  } else {
    y = 7.787 * y + 0.137931034
  }

  if (z > 0.008856) {
    z **= 0.333333333
  } else {
    z = 7.787 * z + 0.137931034
  }

  const l = (116 * y) - 16
  const a = 500 * (x - y)
  const b = 200 * (y - z)

  return { l, a, b }
}

const labToLch = (lab) => {
  const { l, a, b } = lab

  const c = Math.sqrt(a ** 2 + b ** 2)

  let h = Math.atan2(b, a) // Quadrant by signs
  if (h > 0) {
    h = (h / Math.PI) * 180
  } else {
    h = 360 - (Math.abs(h) / Math.PI) * 180
  }

  return { l, c, h }
}

const lchToLab = (lch) => {
  const { l, c, h } = lch

  const a = Math.cos(h * 0.01745329251) * c
  const b = Math.sin(h * 0.01745329251) * c

  return { l, a, b }
}

const labToXyz = (lab) => {
  const { l, a, b } = lab

  let y = (l + 16) / 116
  let x = a / 500 + y
  let z = y - b / 200

  if (y ** 3 > 0.008856) {
    y **= 3
  } else {
    y = (y - 0.137931034) / 7.787
  }

  if (x ** 3 > 0.008856) {
    x **= 3
  } else {
    x = (x - 0.137931034) / 7.787
  }

  if (z ** 3 > 0.008856) {
    z **= 3
  } else {
    z = (z - 0.137931034) / 7.787
  }

  // Observer = 2°, Illuminant = D65
  x *= 95.047
  y *= 100.000
  z *= 108.883

  return { x, y, z }
}

const xyzToRgb = (xyz) => {
  // Observer = 2°, Illuminant = D65
  const x = xyz.x / 100 // X from 0 to 95.047
  const y = xyz.y / 100 // Y from 0 to 100.000
  const z = xyz.z / 100 // Z from 0 to 108.883

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415
  let b = x * 0.0557 + y * -0.2040 + z * 1.0570

  if (r > 0.0031308) {
    r = 1.055 * (r ** 0.41666667) - 0.055
  } else {
    r *= 12.92
  }

  if (g > 0.0031308) {
    g = 1.055 * (g ** 0.41666667) - 0.055
  } else {
    g *= 12.92
  }

  if (b > 0.0031308) {
    b = 1.055 * (b ** 0.41666667) - 0.055
  } else {
    b *= 12.92
  }

  r *= 255
  g *= 255
  b *= 255

  return { r, g, b }
}

const rgbToLch = (rgb) => labToLch(xyzToLab(rgbToXyz(rgb)))
const lchToRgb = (lch) => xyzToRgb(labToXyz(lchToLab(lch)))

export {
  rgbToHsl,
  hslToRgb,
  rgbToLch,
  lchToRgb,
}
