/* NOTE: This file must be imported somewhere in order to run it's top level initialization */
import missingPreview from '../assets/missingPreview.png'

const STATIC_ASSETS_PATH = './_subapps/animate'

let fontData = []
const getFontData = () => fontData

const styleMap = ['normal', 'italic']
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

const loadFont = (font) => {
  const fontFace = new FontFace(font.name, `url(${font.file})`, {
    style: font.style,
    weight: font.weight,
  })
  fontFace.load().then((loadedFont) => {
    document.fonts.add(loadedFont)
    console.log('loaded font', font.name)
  }).catch((err) => {
    console.warn(err)
  })
}

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

// We currently do not plan to support the commented-out weights
const weightLabelMap = {
  100: '100 - Thin',
  // 200: 'Extra 200 - Light',
  300: '300 - Light',
  400: '400 - Normal',
  // 500: '500 - Medium',
  // 600: 'Semi 600 - Bold',
  700: '700 - Bold',
  // 800: 'Extra 800 - Bold',
  900: '900 - Black',
}

// Top-Level Initialization Code -- leave this at bottom of module
if (process.env.NODE_ENV === 'production') {
  fetch(`${STATIC_ASSETS_PATH}/${process.env.REACT_APP_FONT_DATA_FILE}`)
    .then((res) => res.json())
    .then((data) => {
      fontData = mapSlimDataToVerbose(data)
    })
} else {
  // eslint-disable-next-line
  import('../hidden/font-data-google.json')
    .then((module) => {
      fontData = mapSlimDataToVerbose(module.default)
    })
}
const missingPreviewImage = new Image()
missingPreviewImage.src = missingPreview

export {
  browserFonts,
  weightLabelMap,
  getFontData,
  loadFont,
  preloadSetOfFontImages,
}
