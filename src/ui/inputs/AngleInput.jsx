import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'
import { parseAndValidateFloat } from './util'

const AngleInput = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value.degrees}
    parseAndValidateNewValue={parseAndValidateFloat}
    halfWidth
    {...rest}
  />
))

export default AngleInput
