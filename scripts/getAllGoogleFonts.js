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
 * and we will obfuscate keys, and store shared values at top.
 */

const API_KEY = 'AIzaSyBNBuGnLIcqDwPz9zcT_ih101xWkAY7MxA'
const PREVIEW_IMAGE_HOST = 'https://raw.githubusercontent.com/getstencil/GoogleWebFonts-FontFamilyPreviewImages'
const PREVIEW_IMAGE_BASE_URL = `${PREVIEW_IMAGE_HOST}/master/48px/compressed/`
const WEIGHTS_TO_INCLUDE = ['200', '400', '600', '800']

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

      let variantSuffix = ` ${variant}`
      if (variant === 'regular') {
        variantSuffix = ''
      } else if (variant.includes('0i')) {
        variantSuffix = ` ${variant.substring(0, 3)} ${variant.substring(3)}`
      }

      const fontFullURL = fontFamily.files[variant].replace('http://', 'https://')
      const fontSubURL = fontFullURL.replace(fontURLPrefix, '')

      const imageFontFamily = fontFamily.family.replace(/[^\-A-Za-z0-9]/, '')
      let imageVariant = variant
      if (variant === 'regular') {
        imageVariant = '400'
      } else if (variant === 'italic') {
        imageVariant = '400italic'
      }
      const imageFileName = `${imageFontFamily}-${imageVariant}.${fontFamily.version}.png`

      fonts.push({
        n: `${fontFamily.family}${variantSuffix}`,
        c: fontCategories[fontFamily.category],
        f: fontSubURL,
        i: imageFileName,
      })
    })
  })

  const content = JSON.stringify({
    fontURLPrefix,
    imageURLPrefix,
    fontCategories: Object.keys(fontCategories),
    fonts,
  })
  const contentHash = md5(content)

  let fileName = `font-data-google.${contentHash}.json`
  let outputFolder = './public'
  if (process.env.NODE_ENV !== 'production') {
    fileName = 'font-data-google.json'
    outputFolder = './src/hidden'
    await fs.mkdir(outputFolder, { recursive: true })
  }
  await fs.writeFile(`${outputFolder}/${fileName}`, content)

  console.log(`${outputFolder}/${fileName}`)
}

main()
