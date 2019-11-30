const removeObjectKeys = (object, arrayOfKeys) => (
  Object.keys(object)
    .filter(key => (
      arrayOfKeys.includes(key) === false
    ))
    .reduce((accum, key) => {
      // eslint-disable-next-line
      accum[key] = object[key]
      return accum
    }, {})
)

export {
  removeObjectKeys,
}
