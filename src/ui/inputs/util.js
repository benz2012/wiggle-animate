import { isNumber } from '../../utility/numbers'

const parseAndValidateInteger = (value) => {
  const potentialInt = parseInt(value, 10)
  return ({
    isValid: (
      isNumber(potentialInt)
      && `${potentialInt}`.length === value.length
    ),
    parsedValue: potentialInt,
  })
}

const parseAndValidateFloat = (value) => {
  let trimmedOriginal = value.replace(/^0+/g, '')
  if (trimmedOriginal.includes('.')) {
    trimmedOriginal = trimmedOriginal.replace(/0+$/g, '')
  }

  let expectedFloatString = trimmedOriginal
  if (trimmedOriginal === '.' || value === '0') {
    expectedFloatString = '0'
  } else if (trimmedOriginal.startsWith('.')) {
    expectedFloatString = `0${trimmedOriginal}`
  } else if (trimmedOriginal.endsWith('.')) {
    expectedFloatString = trimmedOriginal.substring(0, trimmedOriginal.length - 1)
  }

  const potentialFloat = parseFloat(value)
  return ({
    isValid: (
      isNumber(potentialFloat)
      && value.endsWith('.') === false
      && `${potentialFloat}`.length === expectedFloatString.length
    ),
    parsedValue: potentialFloat,
  })
}

export {
  parseAndValidateInteger,
  parseAndValidateFloat,
}
