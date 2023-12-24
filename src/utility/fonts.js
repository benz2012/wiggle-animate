/* NOTE: This file must be imported somewhere in order to run it's top level initialization */
import missingPreview from '../assets/missingPreview.png'

const STATIC_ASSETS_PATH = './_subapps/animate'

let fontData = []
const getFontData = () => fontData

const typeMap = ['regular', 'italic']
const mapSlimDataToVerbose = (allData) => (
  allData.fonts.map((entry) => ({
    name: entry.n,
    type: typeMap[entry.t],
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
  const fontFace = new FontFace(font.name, `url(${font.file})`)
  fontFace.load().then((loadedFont) => {
    document.fonts.add(loadedFont)
    console.log('loaded font', font.name)
  }).catch((err) => {
    console.warn(err)
  })
}

const browserFonts = [
  { name: 'Sans-Serif', type: 'regular', weight: 400, category: 'sans-serif' },
  { name: 'Serif', type: 'regular', weight: 400, category: 'serif' },
  { name: 'Monospace', type: 'regular', weight: 400, category: 'monospace' },
]

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
  getFontData,
  loadFont,
  preloadSetOfFontImages,
}
