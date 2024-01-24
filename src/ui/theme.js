/* eslint-disable object-curly-newline */

import { createTheme } from '@mui/material/styles'

import Color from '../lib/visuals/Color'

const color = (...rgba) => new Color({ r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] ?? 1 })

const theme = {
  base: {
    spacing: 8,
    palette: {
      primary_dark_dark: color(13, 71, 161),
      primary_dark: color(25, 117, 210),
      primary: color(33, 150, 243),
      secondary: color(8, 207, 101),
      tertiary: color(255, 208, 66),
      background: color(32, 33, 36),
      text: color(255, 255, 255),
      WHITE: color(255, 255, 255),
    },
  },

  get spacing() {
    return {
      1: this.base.spacing,
      2: this.base.spacing * 2,
      3: this.base.spacing * 3,
      4: this.base.spacing * 4,
      '0_5': this.base.spacing * 0.5,
      '1_5': this.base.spacing * 1.5,
    }
  },

  get palette() {
    return {
      primary_dark_dark: {
        100: this.base.palette.primary_dark_dark,
        50: new Color({ ...this.base.palette.primary_dark_dark.spec, a: 0.50 }),
      },
      primary_dark: {
        100: this.base.palette.primary_dark,
        75: new Color({ ...this.base.palette.primary_dark.spec, a: 0.75 }),
        50: new Color({ ...this.base.palette.primary_dark.spec, a: 0.50 }),
        30: new Color({ ...this.base.palette.primary_dark.spec, a: 0.30 }),
        20: new Color({ ...this.base.palette.primary_dark.spec, a: 0.20 }),
      },
      primary: {
        100: this.base.palette.primary,
        75: new Color({ ...this.base.palette.primary.spec, a: 0.75 }),
        15: new Color({ ...this.base.palette.primary.spec, a: 0.15 }),
        10: new Color({ ...this.base.palette.primary.spec, a: 0.10 }),
      },

      secondary: {
        100: this.base.palette.secondary,
      },

      tertiary: {
        100: this.base.palette.tertiary,
        50: new Color({ ...this.base.palette.tertiary.spec, a: 0.50 }),
        20: new Color({ ...this.base.palette.tertiary.spec, a: 0.20 }),
      },

      action: {
        hover: new Color({ ...this.base.palette.WHITE.spec, a: 0.10 }),
        disabled: new Color({ ...this.base.palette.WHITE.spec, a: 0.15 }),
        active: new Color({ ...this.base.palette.WHITE.spec, a: 0.30 }),
        half: new Color({ ...this.base.palette.WHITE.spec, a: 0.50 }),
        selected: new Color({ ...this.base.palette.WHITE.spec, a: 0.80 }),
      },

      background: {
        main: this.base.palette.background,
        fullSend: new Color(0, 0, 0),
        lighter1: new Color({
          r: this.base.palette.background.red + 10,
          g: this.base.palette.background.green + 10,
          b: this.base.palette.background.blue + 10,
        }),
      },

      text: {
        main: this.base.palette.text,
        main_tinted_primary: color(209, 229, 250),
        secondary: this.base.palette.background,
      },

      WHITE: theme.base.palette.WHITE,
    }
  },
}

Object.entries(theme.spacing).forEach(([name, value]) => {
  const cssVariableName = `--spacing-${name}`
  document.documentElement.style.setProperty(cssVariableName, `${value}px`)
})

Object.entries(theme.palette).forEach(([category, colors]) => {
  // skip all uppercase accessory definitions
  if (/[A-Z]/.test(category)) return
  Object.entries(colors).forEach(([name, colorObj]) => {
    const cssVariableName = `--palette-${category}-${name}`
    document.documentElement.style.setProperty(cssVariableName, colorObj.toString())
  })
})

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: `${theme.base.palette.primary}`,
    },
    secondary: {
      main: `${theme.base.palette.secondary}`,
    },
    background: {
      paper: `${theme.base.palette.background}`,
    },
  },
})

export default theme
export {
  muiTheme,
}
