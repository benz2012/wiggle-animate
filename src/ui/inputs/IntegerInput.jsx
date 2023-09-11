import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'

const IntegerInput = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    parseAndValidateNewValue={(newValue) => {
      const potentialInt = parseInt(newValue, 10)
      return ({
        isValid: (
          Number.isNaN(potentialInt) === false
          && `${potentialInt}`.length === newValue.length
        ),
        parsedValue: potentialInt,
      })
    }}
    halfWidth
    {...rest}
  />
))

export default IntegerInput
