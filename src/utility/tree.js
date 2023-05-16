import Container from '../lib/structure/Container'
import { isObject } from './object'

const peekAtObservables = (item) => {
  let propsToLookAt = item.observables

  propsToLookAt = propsToLookAt.filter((prop) => (
    Container.IGNORE_WHEN_PEEKING.includes(prop) === false
  ))

  const hasNested = isObject(item) && 'nestedObservables' in item
  if (hasNested) {
    propsToLookAt = propsToLookAt.filter((prop) => (
      item.nestedObservables.includes(prop) === false
    ))
  }

  const peeked = propsToLookAt.map((property) => item[property])
  if (isObject(item) && 'nestedObservables' in item) {
    peeked.push(
      ...item.nestedObservables.map((property) => peekAtObservables(item[property]))
    )
  }

  if (item instanceof Container) {
    peeked.push(
      ...Object.values(item.children).map(peekAtObservables)
    )
  }

  return peeked
}

const peekAtKeyframes = (item) => {
  const peeked = Object.values(item.keyframes).map((listOfKeyframes) => (
    listOfKeyframes.map(peekAtObservables)
  ))

  if (item instanceof Container) {
    peeked.push(
      ...Object.values(item.children).map(peekAtKeyframes)
    )
  }

  return peeked
}

export {
  peekAtObservables,
  peekAtKeyframes,
}
