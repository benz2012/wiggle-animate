import { isString } from './string'

const FLOAT_PRECISION = 6

const isNumber = (value) => (
  typeof value === 'number' && !Number.isNaN(value)
)

const isOdd = (value) => (
  (value % 2) === 1
)

const _stringToTruncatedFloat = (str) => {
  const [leftHand, rightHand] = str.split('.')
  const truncatedDecimal = rightHand.substring(0, FLOAT_PRECISION)
  const truncatedFloat = parseFloat(`${leftHand}.${truncatedDecimal}`)
  return truncatedFloat
}

const truncateFloatLeaveInt = (value) => {
  if (isString(value)) {
    return _stringToTruncatedFloat(value)
  }

  if (!isNumber(value)) {
    throw TypeError('truncateFloat must recive a string or number as input')
  }

  if (Number.isSafeInteger(value)) {
    return value
  }

  return _stringToTruncatedFloat(`${value}`)
}

export {
  isNumber,
  isOdd,
  truncateFloatLeaveInt,
}
