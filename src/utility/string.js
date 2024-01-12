const START_OF_NORMAL_CHARS = 58
const END_OF_NORMAL_CHARS = 126

const isString = (value) => (
  typeof value === 'string' || value instanceof String
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

export {
  START_OF_NORMAL_CHARS,
  END_OF_NORMAL_CHARS,
  isString,
  incrementName,
}
