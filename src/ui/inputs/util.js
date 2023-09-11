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
  const potentialFloat = parseFloat(value)
  return ({
    isValid: (
      isNumber(potentialFloat)
      && value.endsWith('.') === false
      && `${potentialFloat}`.length === value.length
    ),
    parsedValue: potentialFloat,
  })
}

export {
  parseAndValidateInteger,
  parseAndValidateFloat,
}
