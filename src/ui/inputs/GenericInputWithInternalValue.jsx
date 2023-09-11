import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'

import InputLabel from './InputLabel'
import InputBox from './InputBox'

const GenericInputWithInternalValue = observer(({
  label,
  propertyValue,
  subProperties, // if this exists, treat it as having multiple sub-properties
  parseAndValidateNewValue,
  setPropertyValue,
  ...rest
}) => {
  const isMulti = Array.isArray(subProperties)

  // The internal value allows us to track invalid strings in the input
  // box, without corrupting the value of the targetProperty.
  // When one is set, it indicates that the inputbox is in an error state
  const [internalValue, setInternalValue] = useState(
    !isMulti ? null : (
      subProperties.reduce((accum, curr) => {
        // eslint-disable-next-line no-param-reassign
        accum[curr] = null
        return accum
      }, {})
    )
  )

  const setValue = (event, subProp) => {
    const { value: newValue } = event.target

    const { isValid, parsedValue } = parseAndValidateNewValue(newValue)
    if (!isValid) {
      if (subProp) {
        setInternalValue({ ...internalValue, [subProp]: newValue })
      } else {
        setInternalValue(newValue)
      }
      return
    }

    if (subProp) {
      // NOTE: this array needs to be ordered to match the order of arguments in the constructor
      const nextMultiValue = subProperties.map((_subProp) => (
        _subProp === subProp ? parsedValue : propertyValue[_subProp]
      ))
      setPropertyValue(nextMultiValue)
    } else {
      setPropertyValue(parsedValue)
    }

    if (subProp) {
      setInternalValue({ ...internalValue, [subProp]: null })
    } else {
      setInternalValue(null)
    }
  }

  const subPropSetter = (subProp) => (event) => setValue(event, subProp)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <InputLabel
        label={!isMulti ? label : `${label}-${subProperties[0]}`}
        hasSubProp={isMulti}
      />

      <Box sx={{ flexGrow: 1 }} />

      {!isMulti ? (
        <InputBox
          label={label}
          value={internalValue ?? propertyValue}
          setValue={setValue}
          onBlur={() => setInternalValue(null)}
          error={internalValue !== null}
          {...rest}
        />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {subProperties.map((subProp) => {
            const subPropValue = propertyValue[subProp]
            return (
              <InputBox
                key={`${label}-${subProp}`}
                label={`${label}-${subProp}`}
                value={internalValue[subProp] ?? subPropValue}
                setValue={subPropSetter(subProp)}
                onBlur={() => setInternalValue({ ...internalValue, [subProp]: null })}
                error={internalValue[subProp] !== null}
                halfWidth
                {...rest}
              />
            )
          })}
        </Box>
      )}
    </Box>
  )
})

export default GenericInputWithInternalValue
