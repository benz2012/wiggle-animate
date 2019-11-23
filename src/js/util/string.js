const titleCase = (str) => {
  /* Convert `any string` into `Any String`, including replacing underscores
    with spaces */
  const splitStr = str.toLowerCase().split(/[\s_]+/)
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  return splitStr.join(' ')
}

export {
  titleCase,
}
