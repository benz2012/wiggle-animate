import { isString } from './string'

const FLOAT_PRECISION = 6

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

  if (Number.isNaN(value)) {
    throw TypeError('truncateFloat must recive a string or number as input')
  }

  if (Number.isSafeInteger(value)) {
    return value
  }

  return _stringToTruncatedFloat(`${value}`)
}

export {
  // eslint-disable-next-line import/prefer-default-export
  truncateFloatLeaveInt,
}
