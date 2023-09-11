import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'
import { parseAndValidateInteger } from './util'

const IntegerInput = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    parseAndValidateNewValue={parseAndValidateInteger}
    halfWidth
    {...rest}
  />
))

export default IntegerInput
