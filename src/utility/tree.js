import Container from '../lib/structure/Container'

const peekAtObservables = (item) => {
  const peekedAt = item.observables.map((propertyName) => `${item[propertyName]}`)

  if (item instanceof Container) {
    peekedAt.push(
      ...Object.values(item.children).map(peekAtObservables)
    )
  }

  return peekedAt
}

const peekAtKeyframes = (item) => {
  const peekedAt = item.keyframables.map((propertyName) => (
    item[propertyName].keyframes.map((keyframe) => `${keyframe}`)
  ))

  if (item instanceof Container) {
    peekedAt.push(
      ...Object.values(item.children).map(peekAtKeyframes)
    )
  }

  return peekedAt
}

export {
  peekAtObservables,
  peekAtKeyframes,
}
