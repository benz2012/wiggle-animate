import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'
import { generateDebouncedSetterAndSubmitter } from '../../utility/state'

const CanvasSizeInput = observer(({ store, availableWidth }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setterAndSubmitter = useCallback(generateDebouncedSetterAndSubmitter(
    store.actionStack,
    'rootContainer.setCanvasSize',
    () => store.rootContainer.canvasSize,
    (newValue) => store.rootContainer.setCanvasSize(newValue),
  ), [])

  return (
    <GenericInputWithInternalValue
      label="size"
      availableWidth={availableWidth}
      propertyValue={store.rootContainer.canvasSize}
      subProperties={['width', 'height']}
      setPropertyValue={setterAndSubmitter}
      parseAndValidateNewValue={(value) => {
        // Values below 10-pixel minimum will be marked invalid
        const parseOutput = parseAndValidateInteger(value)
        if (parseOutput.isValid && parseOutput.parsedValue !== Math.max(parseOutput.parsedValue, 10)) {
          parseOutput.isValid = false
        }
        return parseOutput
      }}
      addDragBox
      noKeyframeGap
    />
  )
})

export default CanvasSizeInput
