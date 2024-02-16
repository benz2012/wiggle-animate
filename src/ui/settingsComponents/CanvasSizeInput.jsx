import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'

const CanvasSizeInput = observer(({ store, availableWidth }) => (
  <GenericInputWithInternalValue
    label="Canvas Size"
    availableWidth={availableWidth}
    propertyValue={store.rootContainer.canvasSize}
    subProperties={['width', 'height']}
    setPropertyValue={(newValue) => store.rootContainer.setCanvasSize(newValue)}
    parseAndValidateNewValue={(value) => {
      // Values below 10-pixel minimum will be marked invalid
      const parseOutput = parseAndValidateInteger(value)
      if (parseOutput.isValid && parseOutput.parsedValue !== Math.max(parseOutput.parsedValue, 10)) {
        parseOutput.isValid = false
      }
      return parseOutput
    }}
    addDragBox
  />
))

export default CanvasSizeInput
