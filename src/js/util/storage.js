const storageEnabled = () => {
  try {
    localStorage.setItem('_test', 'test')
  } catch (e) {
    return false
  }
  return true
}

const storageSet = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const storageGet = (key) => {
  const value = localStorage.getItem(key)
  return value && JSON.parse(value)
}

export {
  storageEnabled,
  storageSet,
  storageGet,
}
