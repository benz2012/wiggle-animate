import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'

import InputLabel from './InputLabel'
import InputBox from './InputBox'
import { ColorBox, ColorPicker } from './ColorSelection'
import CheckboxLock from './CheckboxLock'
import KeyframeButton from './KeyframeButton'
import { PAIRED_VECTOR_TYPES } from '../PropertyEditor/config'
import { isNumber } from '../../utility/numbers'
import { voidFunc } from '../../utility/object'

const GenericInputWithInternalValue = observer(({
  label,
  labelGroup,
  propertyValue,
  subProperties, // if this exists, treat it as having multiple sub-properties
  parseAndValidateNewValue,
  setPropertyValue,
  secondaryValue, // this is NOT for sub-props, it's for sibling props
  setSecondaryPropertyValue,
  pairVector = false,
  togglePairing,
  isKeyframable,
  addKey,
  numKeyframes = 0,
  isKeyframe = false,
  noKeyframeGap = false,
  isColor = false,
  excludeAlpha = false,
  noLabel = false,
  onBlur = voidFunc,
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

  const setValue = (event, subProp, changeNumberBy = 0) => {
    const { value: newValue, immediatelySubmitAction } = event.target

    const { isValid, parsedValue } = parseAndValidateNewValue(newValue)
    if (!isValid) {
      if (subProp) {
        setInternalValue({ ...internalValue, [subProp]: newValue })
      } else {
        setInternalValue(newValue)
      }
      return
    }

    const newParsedValue = isNumber(parsedValue) && changeNumberBy ? (
      parsedValue + changeNumberBy
    ) : (
      parsedValue
    )
    const newParsedValueStr = `${newParsedValue}`
    const { isValid: isValid2 } = parseAndValidateNewValue(newParsedValueStr)
    if (!isValid2) {
      if (subProp) {
        setInternalValue({ ...internalValue, [subProp]: newParsedValueStr })
      } else {
        setInternalValue(newParsedValueStr)
      }
      return
    }

    if (subProp) {
      // NOTE: this array needs to be ordered to match the order of arguments in the constructor
      let nextMultiValue = subProperties.map((_subProp) => (
        _subProp === subProp ? newParsedValue : propertyValue[_subProp]
      ))
      if (pairVector) {
        nextMultiValue = subProperties.map(() => newParsedValue)
      }
      setPropertyValue(nextMultiValue, immediatelySubmitAction)
    } else {
      setPropertyValue(newParsedValue, immediatelySubmitAction)
    }

    if (subProp) {
      setInternalValue({ ...internalValue, [subProp]: null })
    } else {
      setInternalValue(null)
    }
  }

  const subPropSetter = (subProp) => (event) => setValue(event, subProp)

  const incrementValue = (changeBy) => (
    setValue({ target: { value: `${propertyValue}` } }, undefined, changeBy)
  )

  const subPropIncrementValue = (subProp) => (changeBy) => (
    setValue({ target: { value: `${propertyValue[subProp]}` } }, subProp, changeBy)
  )

  const [showColorPicker, toggleColorPicker] = useState(false)
  const setColorPickerValue = (newColorSpec) => {
    const { a: alpha, r, g, b } = newColorSpec
    setPropertyValue({ r, g, b })
    setSecondaryPropertyValue(alpha * 100)
    // We don't need to immediatelySubmitAction here since it will take the user some time to click
    // away from this custom component. If we do ever want a more responsive action submission,
    // we should attatch the immediatelySubmitAction approach to the close method of ColorPicker
  }

  const togglePairVectorLock = () => {
    const nextPairValue = !pairVector
    togglePairing(nextPairValue)
    if (nextPairValue === true) {
      // Force set both props to `x` when re-enabling pairing on the prop
      const nextMultiValue = subProperties.map(() => propertyValue.x)
      setPropertyValue(nextMultiValue)

      // This forces the debounce listener to still capture the leading-edge and trailing-edge
      setPropertyValue(nextMultiValue, true)
    }
  }

  // Add a gap that mimics keyframe button for proper left alignment of labels
  // except for the highest-box `name`
  let keyframeGap = null
  if (label !== 'name' && !noKeyframeGap) {
    keyframeGap = <Box sx={{ marginRight: '16px' }} />
  }

  const renderInputBoxes = () => {
    // Single Property Box Rendering
    if (!isMulti) {
      return (
        <InputBox
          label={label}
          labelGroup={labelGroup}
          value={internalValue ?? propertyValue}
          setValue={setValue}
          incrementValue={incrementValue}
          onBlur={(event) => {
            setInternalValue(null)
            onBlur(event)
          }}
          error={internalValue !== null}
          {...rest}
        />
      )
    }

    // Vector-Property Box Rendering with pairing-lock button
    if (subProperties.length === 2 && PAIRED_VECTOR_TYPES.includes(label)) {
      const [subProp1, subProp2] = subProperties
      const subPropValue1 = propertyValue[subProp1]
      const subPropValue2 = propertyValue[subProp2]
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <InputBox
            key={`${label}-${subProp1}`}
            label={`${label}-${subProp1}`}
            labelGroup={labelGroup}
            value={internalValue[subProp1] ?? subPropValue1}
            setValue={subPropSetter(subProp1)}
            incrementValue={subPropIncrementValue(subProp1)}
            onBlur={(event) => {
              setInternalValue({ ...internalValue, [subProp1]: null })
              onBlur(event)
            }}
            error={internalValue[subProp1] !== null}
            totalBoxes={subProperties.length}
            iconInTheGap
            {...rest}
          />
          <CheckboxLock name="pair vector properties" checked={pairVector} onChange={togglePairVectorLock} />
          <InputBox
            key={`${label}-${subProp2}`}
            label={`${label}-${subProp2}`}
            labelGroup={labelGroup}
            value={internalValue[subProp2] ?? subPropValue2}
            setValue={subPropSetter(subProp2)}
            incrementValue={subPropIncrementValue(subProp2)}
            onBlur={(event) => {
              setInternalValue({ ...internalValue, [subProp2]: null })
              onBlur(event)
            }}
            error={internalValue[subProp2] !== null}
            totalBoxes={subProperties.length}
            iconInTheGap
            {...rest}
          />
        </Box>
      )
    }

    // General Multi-Sub-Property Box Rendering
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {subProperties.map((subProp) => {
          const subPropValue = propertyValue[subProp]
          return (
            <InputBox
              key={`${label}-${subProp}`}
              label={`${label}-${subProp}`}
              labelGroup={labelGroup}
              value={internalValue[subProp] ?? subPropValue}
              setValue={subPropSetter(subProp)}
              incrementValue={subPropIncrementValue(subProp)}
              onBlur={(event) => {
                setInternalValue({ ...internalValue, [subProp]: null })
                onBlur(event)
              }}
              error={internalValue[subProp] !== null}
              totalBoxes={subProperties.length}
              {...rest}
            />
          )
        })}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {noLabel === false && (
        <>
          {isKeyframable ? (
            <KeyframeButton
              frameHasKey={isKeyframe}
              otherFramesHaveKeys={numKeyframes > 0}
              addKey={addKey}
            />
          ) : (keyframeGap)}
          <InputLabel
            label={!isMulti ? label : `${label}-${subProperties[0]}`}
            labelGroup={labelGroup}
            hasSubProp={isMulti}
          />
          <Box sx={{ flexGrow: 1 }} />
        </>
      )}

      {isColor && (
        <ColorBox
          color={propertyValue.toString()}
          onClick={() => toggleColorPicker(!showColorPicker)}
        />
      )}
      {showColorPicker && (
        <ColorPicker
          color={{ ...propertyValue.spec, a: secondaryValue / 100 }}
          setColor={setColorPickerValue}
          close={() => toggleColorPicker(false)}
          excludeAlpha={excludeAlpha}
        />
      )}

      {renderInputBoxes()}
    </Box>
  )
})

export default GenericInputWithInternalValue
