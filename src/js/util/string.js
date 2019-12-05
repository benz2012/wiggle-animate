const titleCase = (str) => {
  /* Convert `any string` into `Any String`, including replacing underscores
    with spaces */
  const splitStr = str.toLowerCase().split(/[\s_]+/)
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  return splitStr.join(' ')
}

const simpleHash = (str) => {
  /* eslint no-bitwise: 0 */
  let hash = 0
  if (str.length === 0) return hash

  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash &= hash
  }

  return hash
}

export {
  titleCase,
  simpleHash,
}
