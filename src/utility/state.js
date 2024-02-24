import { makeObservable, observable, override } from 'mobx'
import debounce from 'lodash.debounce'

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

const DEBOUNCE_DELAY_MS = 500

const generateDebouncedSetterAndSubmitter = (actionStack, setterPathRef, getterFunc, setterFunc) => {
  const state = {
    currentEdge: 'LEADING',
    valueBefore: null,
    beingFlushed: false,
  }

  const actionSubmitter = () => {
    if (state.currentEdge === 'LEADING') {
      state.valueBefore = getterFunc()
      state.currentEdge = 'TRAILING'
    } else if (state.currentEdge === 'TRAILING') {
      const valueAfter = getterFunc()
      const hasValueReallyChanged = JSON.stringify(state.valueBefore) !== JSON.stringify(valueAfter)

      const isImmediate = state.beingFlushed
      if (hasValueReallyChanged) {
        actionStack.push({
          performedAt: isImmediate ? Date.now() : Date.now() - DEBOUNCE_DELAY_MS,
          perform: [setterPathRef, [valueAfter]],
          revert: [setterPathRef, [state.valueBefore]],
        })
      }

      state.valueBefore = null
      state.beingFlushed = false
      state.currentEdge = 'LEADING'
    }
  }
  const debouncedActionSubmitter = debounce(actionSubmitter, DEBOUNCE_DELAY_MS, { leading: true, trailing: true })

  const rapidValueSetter = (newValue, immediatelySubmitAction = false) => {
    if (state.currentEdge === 'LEADING' && !immediatelySubmitAction) {
      debouncedActionSubmitter()
    }

    setterFunc(newValue)

    if (state.currentEdge === 'TRAILING') {
      if (immediatelySubmitAction) {
        state.beingFlushed = true
        debouncedActionSubmitter.flush(true)
      } else {
        debouncedActionSubmitter()
      }
    }
  }

  return rapidValueSetter
}

export {
  observeListOfProperties,
  keyframeLabelFromProperty,
  generateDebouncedSetterAndSubmitter,
  DEBOUNCE_DELAY_MS,
}
