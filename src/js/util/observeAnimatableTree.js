const observeAnimatableTree = (observableObj) => {
  const observableKeys = observableObj.constructor.OBSERVABLES
  return observableKeys.map((key) => {
    if (key === 'keyframes') {
      return Object.keys(observableObj.keyframes).map(keyFrType => (
        observableObj.keyframes[keyFrType].map(observeAnimatableTree)
      ))
    }

    const value = observableObj[key]
    if (value.constructor.OBSERVABLES) {
      return observeAnimatableTree(value)
    }

    return value
  })
}

export default observeAnimatableTree
