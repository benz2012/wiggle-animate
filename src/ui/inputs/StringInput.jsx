import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'

const StringInput = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    parseAndValidateNewValue={(newValue) => ({
      isValid: true,
      parsedValue: newValue,
    })}
    {...rest}
  />
))

export default StringInput
