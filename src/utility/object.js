const isObject = (valueToCheck) => (
  typeof valueToCheck === 'object' && valueToCheck !== null
)

const isPrimitive = (valueToCheck) => (
  valueToCheck !== Object(valueToCheck)
)

const replaceKeysInObj = (obj, oldKeyNewKeyMap) => {
  if (isPrimitive(obj)) return obj

  // Handle array just by handling their contents
  if (Array.isArray(obj)) {
    return obj.map((arr) => replaceKeysInObj(arr, oldKeyNewKeyMap))
  }

  const final = {}

  /* eslint-disable no-restricted-syntax */
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      // Get the destination key
      const destKey = key in oldKeyNewKeyMap ? oldKeyNewKeyMap[key] : key

      // Get the value
      let value = obj[key]

      // If this is an object, recurse
      if (isObject(value)) {
        value = replaceKeysInObj(value, oldKeyNewKeyMap)
      }

      // Set it on the result using the destination key
      final[destKey] = value
    }
  }

  return final
}

export {
  isObject,
  isPrimitive,
  replaceKeysInObj,
}
