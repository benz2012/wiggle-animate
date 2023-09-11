import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from './GenericInputWithInternalValue'
import { isNumber } from '../../utility/numbers'

const IntegerInput = observer(({ targetProperty, ...rest }) => (
  <GenericInputWithInternalValue
    propertyValue={targetProperty.value}
    parseAndValidateNewValue={(newValue) => {
      const potentialInt = parseInt(newValue, 10)
      return ({
        isValid: (
          isNumber(potentialInt)
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
