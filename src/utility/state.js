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

export {
  // eslint-disable-next-line import/prefer-default-export
  observeListOfProperties,
}
