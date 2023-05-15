const START_OF_NORMAL_CHARS = 58
const END_OF_NORMAL_CHARS = 126

const isString = (value) => (
  typeof value === 'string' || value instanceof String
)

export {
  START_OF_NORMAL_CHARS,
  END_OF_NORMAL_CHARS,
  isString,
}
