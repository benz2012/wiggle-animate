/* NOTE: This file must be imported somewhere in order to run it's top level initialization */
import missingPreview from '../assets/missingPreview.png'

const STATIC_ASSETS_PATH = './_subapps/animate'

let fontListData = {}
const getFontListData = () => fontListData

const preloadSetOfFontImages = (fontList, onEachImageLoaded) => {
  const { imageURLPrefix } = getFontListData()
  let numLoaded = 0

  fontList.forEach((fontData) => {
    if (fontData.i === '0') return
    const image = new Image()

    image.onload = () => {
      numLoaded += 1
      onEachImageLoaded(numLoaded)
    }

    image.src = `${imageURLPrefix}${fontData.i}`
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

// Top-Level Initialization Code -- leave this at bottom of module
if (process.env.NODE_ENV === 'production') {
  fetch(`${STATIC_ASSETS_PATH}/${process.env.REACT_APP_FONT_DATA_FILE}`)
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
const missingPreviewImage = new Image()
missingPreviewImage.src = missingPreview

export {
  getFontListData,
  loadFont,
  preloadSetOfFontImages,
}
