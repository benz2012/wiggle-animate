import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'
import { parseAndValidateFloat } from './util'

const SizeInput = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    subProperties={['width', 'height']}
    parseAndValidateNewValue={parseAndValidateFloat}
    {...rest}
  />
))

export default SizeInput
