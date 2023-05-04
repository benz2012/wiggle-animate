const isObject = (valueToCheck) => (
  typeof valueToCheck === 'object' && valueToCheck !== null
)

export {
  // eslint-disable-next-line import/prefer-default-export
  isObject,
}
