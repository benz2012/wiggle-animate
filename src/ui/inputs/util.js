import { isNumber } from '../../utility/numbers'

const parseAndValidateFloat = (newValue) => {
  const potentialFloat = parseFloat(newValue)
  return ({
    isValid: (
      isNumber(potentialFloat)
      && newValue.endsWith('.') === false
      && `${potentialFloat}`.length === newValue.length
    ),
    parsedValue: potentialFloat,
  })
}

export {
  // eslint-disable-next-line import/prefer-default-export
  parseAndValidateFloat,
}
