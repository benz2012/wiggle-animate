import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'

const AnimationLengthInput = observer(({ store, availableWidth }) => (
  <GenericInputWithInternalValue
    label="frame length"
    availableWidth={availableWidth}
    halfWidth
    propertyValue={store.animation.frames}
    setPropertyValue={(newValue) => store.animation.setLength(newValue)}
    parseAndValidateNewValue={(value) => {
      // Values below 1 minimum will be marked invalid
      const parseOutput = parseAndValidateInteger(value)
      if (parseOutput.isValid && parseOutput.parsedValue !== Math.max(parseOutput.parsedValue, 1)) {
        parseOutput.isValid = false
      }
      return parseOutput
    }}
    addDragBox
  />
))

export default AnimationLengthInput
