/* eslint-disable no-await-in-loop */
const fs = require('node:fs/promises')
const md5 = require('md5')

/**
 * This script will query for a list of google fonts, process metadata about them
 * and then save a set of data regarding the font-family's name, and a link
 * to a preview image for that font (hosted on github by the Stencil team)
 *
 * That data map will be included in the hosted files, and served to the users,
 * so that they can choose which fonts they would like in their project.
 *
 * The selection of fonts chosen by the user will be loaded dynamically into the app.
 *
 * Too keep this bundle a bit smaller, we will only keep certain font weights,
 * and we will obfuscate keys, and store shared values at top. Some values
 * encoded as numbers to save as much space as possible (eliminates quotes)
 */

if (!process.env.GOOGLE_FONTS_API_KEY) {
  console.warn('GOOGLE_FONTS_API_KEY environment variable must be set!')
  process.exit(1)
}

const API_KEY = process.env.GOOGLE_FONTS_API_KEY
const PREVIEW_IMAGE_HOST = 'https://raw.githubusercontent.com/getstencil/GoogleWebFonts-FontFamilyPreviewImages'
const PREVIEW_IMAGE_BASE_URL = `${PREVIEW_IMAGE_HOST}/master/48px/compressed/`
const WEIGHT_LABEL_MAP = {
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
const WEIGHTS_TO_INCLUDE = Object.keys(WEIGHT_LABEL_MAP).map((k) => `${k}`)

async function main() {
  const fontFamilys = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&capability=WOFF2`)
    .then((res) => res.json())
    .then((data) => data.items)

  const fonts = []
  const fontURLPrefix = 'https://fonts.gstatic.com/s/'
  const imageURLPrefix = PREVIEW_IMAGE_BASE_URL
  const fontCategories = {
    'sans-serif': 0,
    serif: 1,
    monospace: 2,
    display: 3,
    handwriting: 4,
  }

  fontFamilys.forEach((fontFamily) => {
    fontFamily.variants.forEach((variant) => {
      const weight = ['regular', 'italic'].includes(variant) ? '400' : variant.substring(0, 3)
      if (WEIGHTS_TO_INCLUDE.includes(weight) === false) return

      let variantStyle = 0 // regular
      if (variant === 'italic' || variant.includes('0i')) {
        variantStyle = 1 // italic
      }

      let variantWeight = 4 // 400
      if (variant.includes('0')) {
        variantWeight = parseInt(variant.charAt(0), 10)
      }

      const fontFullURL = fontFamily.files[variant].replace('http://', 'https://')
      const fontSubURL = fontFullURL.replace(fontURLPrefix, '')

      const imageFontFamily = fontFamily.family.replaceAll(/[^\-A-Za-z0-9]/g, '')
      let imageVariant = variant
      if (variant === 'regular') {
        imageVariant = '400'
      } else if (variant === 'italic') {
        imageVariant = '400italic'
      }
      const imageFileName = `${imageFontFamily}-${imageVariant}.${fontFamily.version}.png`

      /**
       * n: name
       * s: style
       * w: weight
       * c: category
       * f: file
       * i: image
       */
      fonts.push({
        n: fontFamily.family,
        s: variantStyle,
        w: variantWeight,
        c: fontCategories[fontFamily.category],
        f: fontSubURL,
        i: imageFileName,
      })
    })
  })

  let brokenImages = 0
  const chunkSize = 100
  const numChunks = Math.ceil(fonts.length / chunkSize)
  const allResponses = []
  for (let n = 0; n < numChunks; n += 1) {
    console.log('checking font chunk', n * chunkSize, '-', (n + 1) * chunkSize)
    const chunk = fonts.slice(n * chunkSize, (n + 1) * chunkSize)
    const responses = await Promise.all(chunk.map((font) => (
      fetch((`${imageURLPrefix}${font.i}`), { method: 'HEAD' })
    )))
    allResponses.push(...responses)
  }
  const youngerVersionsToTry = []
  allResponses.forEach((res, idx) => {
    if (res.status !== 200) {
      brokenImages += 1
      const vNumMatch = fonts[idx].i.match(/\.v(\d+)\.png/)
      youngerVersionsToTry.push([
        idx,
        Array.from(Array(parseInt(vNumMatch[1], 10) - 1)).map((_, nidx) => (
          fonts[idx].i.replace(`.v${vNumMatch[1]}.png`, `.v${nidx + 1}.png`)
        )),
      ])
      fonts[idx].i = '0'
    }
  })
  console.log('trying backwards version numbers for broken images')
  const youngerTries = []
  for (let j = 0; j < youngerVersionsToTry.length; j += 1) {
    const [origIdx, fNames] = youngerVersionsToTry[j]
    const responses = await Promise.all(fNames.map((fName) => (
      fetch((`${imageURLPrefix}${fName}`), { method: 'HEAD' })
    )))
    youngerTries.push([origIdx, responses, fNames])
  }
  const youngerTriesSuccess = {}
  youngerTries.forEach((yt) => {
    youngerTriesSuccess[yt[0]] = ''
    yt[1].forEach((tryResponse, tridx) => {
      if (tryResponse.status === 200) {
        youngerTriesSuccess[yt[0]] = yt[2][tridx]
      }
    })
  })
  Object.entries(youngerTriesSuccess).forEach((entry) => {
    const originalFontIndex = entry[0]
    const newWorkingImageName = entry[1]
    if (newWorkingImageName === '') return
    brokenImages -= 1
    fonts[originalFontIndex].i = newWorkingImageName
  })
  console.log('found', brokenImages, 'broken image links')

  const content = JSON.stringify({
    fontURLPrefix,
    imageURLPrefix,
    fontCategories: Object.keys(fontCategories),
    weightLabels: WEIGHT_LABEL_MAP,
    fonts,
  })

  const outputFolder = './src/assets'
  const fileName = 'font-data-google.json'
  await fs.writeFile(`${outputFolder}/${fileName}`, content)
  console.log(`output written to: ${outputFolder}/${fileName}`)

  if (process.env.NODE_ENV === 'production') {
    const prodOutputFolder = './public'

    // Start by deleting the previous production file
    const regex = /^font-data-google*/
    const existingfiles = await fs.readdir(prodOutputFolder)
    const previousProdData = existingfiles.find((f) => regex.test(f))
    await fs.unlink(`${prodOutputFolder}/${previousProdData}`)

    // Then generate the new one (hash could be the same as before if nothing changed)
    const contentHash = md5(content)
    const prodFileName = `font-data-google.${contentHash}.json`
    await fs.writeFile(`${prodOutputFolder}/${prodFileName}`, content)
    console.log(`output written to: ${prodOutputFolder}/${prodFileName}`)
  }
}

main()
