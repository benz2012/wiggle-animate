import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'
import { parseAndValidateFloat } from './util'

const FloatInput = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    parseAndValidateNewValue={parseAndValidateFloat}
    halfWidth
    {...rest}
  />
))

export default FloatInput
