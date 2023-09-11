import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'
import { parseAndValidateFloat } from './util'

const Vector2Input = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    subProperties={['x', 'y']}
    parseAndValidateNewValue={parseAndValidateFloat}
    {...rest}
  />
))

export default Vector2Input
