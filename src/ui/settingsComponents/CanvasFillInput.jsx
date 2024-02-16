import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'
import { voidFunc } from '../../utility/object'

const CanvasFillInput = observer(({ store, availableWidth }) => (
  <GenericInputWithInternalValue
    label="fill color"
    availableWidth={availableWidth}
    propertyValue={store.rootContainer.canvasFill}
    // We aren't allowing alpha editing at this time, but this is needed to prevent the
    // colorpicker component from entering an infinite render loop
    secondaryValue={100}
    subProperties={['red', 'green', 'blue']}
    setPropertyValue={(newValue) => store.rootContainer.setCanvasFill(newValue)}
    setSecondaryPropertyValue={voidFunc}
    parseAndValidateNewValue={parseAndValidateInteger}
    isColor
    excludeAlpha
    addDragBox
  />
))

export default CanvasFillInput
