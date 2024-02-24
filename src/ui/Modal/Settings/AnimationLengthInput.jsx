import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from '../../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../../inputs/util'
import { generateDebouncedSetterAndSubmitter } from '../../../utility/state'

const AnimationLengthInput = observer(({ store, availableWidth }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setterAndSubmitter = useCallback(generateDebouncedSetterAndSubmitter(
    store.actionStack,
    'animation.setLength',
    () => store.animation.frames,
    (newValue) => store.animation.setLength(newValue),
  ), [])

  return (
    <GenericInputWithInternalValue
      label="frame length"
      availableWidth={availableWidth}
      halfWidth
      propertyValue={store.animation.frames}
      setPropertyValue={setterAndSubmitter}
      parseAndValidateNewValue={(value) => {
        // Values below 1 minimum will be marked invalid
        const parseOutput = parseAndValidateInteger(value)
        if (parseOutput.isValid && parseOutput.parsedValue !== Math.max(parseOutput.parsedValue, 1)) {
          parseOutput.isValid = false
        }
        return parseOutput
      }}
      addDragBox
      noKeyframeGap
    />
  )
})

export default AnimationLengthInput
