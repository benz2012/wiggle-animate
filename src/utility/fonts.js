/* NOTE: This file must be imported somewhere in order to run it's top level initialization */
import missingPreview from '../assets/missingPreview.png'

const STATIC_ASSETS_PATH = './_subapps/animate'

let fontDataHeaders = {}
const getFontDataHeaders = () => fontDataHeaders
let fontData = []
const getFontData = () => fontData

const styleMap = ['normal', 'italic']
const getWeightMap = () => getFontDataHeaders().weightLabels || {}
const getCategoryMap = () => getFontDataHeaders().fontCategories || []

const browserFonts = ['Sans-Serif', 'Serif', 'Monospace'].map((name) => (
  [400, 700].map((weight) => (
    ['normal', 'italic'].map((style) => ({
      name,
      weight,
      style,
      category: name.toLowerCase(),
    }))
  ))
)).flat(Infinity)

const mapSlimDataToVerbose = (allData) => (
  allData.fonts.map((entry) => ({
    name: entry.n,
    style: styleMap[entry.s],
    weight: entry.w * 100,
    category: allData.fontCategories[entry.c],
    file: `${allData.fontURLPrefix}${entry.f}`,
    image: entry.i === '0' ? missingPreview : `${allData.imageURLPrefix}${entry.i}`,
  }))
)

const preloadSetOfFontImages = (fontList, onEachImageLoaded) => {
  let numLoaded = 0

  fontList.forEach((font) => {
    if (font.image === missingPreview) {
      numLoaded += 1
      onEachImageLoaded(numLoaded)
      return
    }

    const image = new Image()
    image.onload = () => {
      numLoaded += 1
      onEachImageLoaded(numLoaded)
    }
    image.src = font.image
  })
}

const loadFont = async (font) => {
  const fontFace = new FontFace(font.name, `url(${font.file})`, {
    style: font.style,
    weight: font.weight,
  })
  try {
    const loadedFont = await fontFace.load()
    document.fonts.add(loadedFont)
  } catch (err) {
    console.warn(err)
  }
  return true
}

const serializeFont = (font) => (
  `${font.name}-${font.style}-${font.weight}`
)

// Top-Level Initialization Code -- leave this at bottom of module
if (process.env.NODE_ENV === 'production') {
  fetch(`${STATIC_ASSETS_PATH}/${process.env.REACT_APP_FONT_DATA_FILE}`)
    .then((res) => res.json())
    .then((data) => {
      fontData = mapSlimDataToVerbose(data)
      fontDataHeaders = data
      delete fontDataHeaders.fonts
    })
} else {
  // eslint-disable-next-line
  import('../hidden/font-data-google.json')
    .then((module) => {
      fontData = mapSlimDataToVerbose(module.default)
      fontDataHeaders = module.default
      delete fontDataHeaders.fonts
    })
}
const missingPreviewImage = new Image()
missingPreviewImage.src = missingPreview

export {
  getWeightMap,
  getCategoryMap,
  browserFonts,
  getFontData,
  loadFont,
  serializeFont,
  preloadSetOfFontImages,
}
