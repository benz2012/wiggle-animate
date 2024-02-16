const START_OF_NORMAL_CHARS = 58
const END_OF_NORMAL_CHARS = 126

const isString = (value) => (
  typeof value === 'string' || value instanceof String
)

const titleCase = (txt) => (
  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
)

const incrementName = (nameStr) => {
  const numeralFound = nameStr.match(/(.+\s)(\d+)/)
  if (numeralFound) {
    const [_, namePrefix, numStr] = numeralFound
    const incremented = parseInt(numStr, 10) + 1
    return `${namePrefix}${incremented}`
  }
  return `${nameStr} 2`
}

let browserModifierKey = '^'
if ('userAgentData' in navigator) {
  const { platform } = navigator.userAgentData
  if (['macOS', 'iOS'].includes(platform)) {
    browserModifierKey = '⌘'
  }
} else if ('platform' in navigator) {
  if (navigator.platform.indexOf('Mac') === 0 || navigator.platform.startsWith('iP')) {
    browserModifierKey = '⌘'
  }
}
const getBrowserModifierKey = () => browserModifierKey

export {
  START_OF_NORMAL_CHARS,
  END_OF_NORMAL_CHARS,
  isString,
  titleCase,
  incrementName,
  getBrowserModifierKey,
}
