import { makeObservable, observable, override } from 'mobx'

const observeListOfProperties = (instance, listOfProps, inheritedListOfProps = []) => {
  makeObservable(instance, listOfProps.reduce((final, property) => {
    /* eslint-disable no-param-reassign */
    if (inheritedListOfProps.includes(property)) {
      final[property] = override
    } else {
      final[property] = observable
    }
    return final
  }, {}))
}

const keyframeLabelFromProperty = (property) => {
  let keyframeLabel = `${property.group}-${property.label}`
  if (!property.group || ['transform', 'size'].includes(property.group)) {
    keyframeLabel = property.label
  }
  return keyframeLabel
}

export {
  observeListOfProperties,
  keyframeLabelFromProperty,
}
