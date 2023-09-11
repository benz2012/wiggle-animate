import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'
import { parseAndValidateInteger } from './util'

const ColorInput = observer(({ targetProperty, secondaryProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    subProperties={['red', 'green', 'blue']}
    parseAndValidateNewValue={parseAndValidateInteger}
    isColor
    secondaryValue={secondaryProperty.value}
    {...rest}
  />
))

export default ColorInput
