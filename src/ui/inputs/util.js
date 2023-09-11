const parseAndValidateFloat = (newValue) => {
  const potentialFloat = parseFloat(newValue)
  return ({
    isValid: (
      Number.isNaN(potentialFloat) === false
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
