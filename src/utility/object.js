const isObject = (valueToCheck) => (
  typeof valueToCheck === 'object' && valueToCheck !== null
)

const isPrimitive = (valueToCheck) => (
  valueToCheck !== Object(valueToCheck)
)

export {
  isObject,
  isPrimitive,
}
