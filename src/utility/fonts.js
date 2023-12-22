/* NOTE: This file must be imported somewhere in order to run it's top level initialization */

let fontListData = {}
const getFontListData = () => fontListData

if (process.env.NODE_ENV === 'production') {
  fetch(`${process.env.REACT_APP_FONT_DATA_FILE}`)
    .then((res) => res.json())
    .then((data) => {
      fontListData = data
    })
} else {
  // eslint-disable-next-line
  import('../hidden/font-data-google.json')
    .then((module) => {
      fontListData = module.default
    })
}

const loadFont = (fontName) => {
  const { fonts, fontURLPrefix } = getFontListData()
  const fontData = fonts.find((elm) => elm.n === fontName)
  if (!fontData) {
    console.log('fontdata not found for', fontName)
    return
  }

  const fontFace = new FontFace(fontData.n, `url(${fontURLPrefix}${fontData.f})`)
  fontFace.load().then((font) => {
    document.fonts.add(font)
    console.log('loaded font', fontData.n)
  }).catch((err) => {
    console.warn(err)
  })
}

export {
  getFontListData,
  loadFont,
}
