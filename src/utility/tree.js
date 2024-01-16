import Container from '../lib/structure/Container'
import { isObject } from './object'

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

const flattenTreeToRelationships = (tree) => {
  let relationships = {}
  const [containerId, children] = Object.entries(tree)[0]
  relationships[containerId] = []

  children.forEach((childId) => {
    if (isObject(childId)) {
      const containerChildId = Object.keys(childId)[0]
      relationships[containerId].push(containerChildId)
      relationships = { ...relationships, ...flattenTreeToRelationships(childId) }
    } else {
      relationships[containerId].push(childId)
    }
  })

  return relationships
}

export {
  peekAtObservables,
  peekAtKeyframes,
  flattenTreeToRelationships,
}
