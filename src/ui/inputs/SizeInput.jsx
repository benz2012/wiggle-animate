import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'

const SizeInput = observer(({ width: inputWidth, name, targetProperty }) => {
  // The internal value allows us to track invalid strings in the input
  // box, without corrupting the value of the targetProperty.
  // When one is set, it indicates that the inputbox is in an error state
  const [internalValue, setInternalValue] = useState({
    width: null,
    height: null,
  })

  const setter = (subProp) => (event) => {
    const { value } = event.target

    const potentialFloat = parseFloat(value)
    if (Number.isNaN(potentialFloat)) {
      setInternalValue({ ...internalValue, [subProp]: value })
      return
    }

    if (value.endsWith('.')) {
      setInternalValue({ ...internalValue, [subProp]: value })
      return
    }

    if (subProp === 'width') {
      targetProperty.setValue([potentialFloat, targetProperty.value.height])
    } else if (subProp === 'height') {
      targetProperty.setValue([targetProperty.value.width, potentialFloat])
    }
    setInternalValue({ ...internalValue, [subProp]: null })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        component="label"
        htmlFor={`input-${name}-width`}
        sx={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'text.disabled',
          cursor: 'pointer',
          '&:hover': { color: 'text.secondary' },
        }}
      >
        {name}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <InputBase
        id={`input-${name}-width`}
        sx={(theme) => ({
          width: `calc(${(inputWidth / 2)}px - ${theme.spacing(0.25)})`,
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          mr: 0.5,
          '&:hover': { backgroundColor: 'action.selected' },
          '&:focus-within': { outline: `1px solid ${theme.palette.primary.main}` },
          '&.Mui-error': { outline: `1px solid ${theme.palette.error.main}` },
        })}
        inputProps={{
          sx: {
            p: 0,
            fontSize: 12,
          },
          spellCheck: false,
        }}
        value={internalValue.width ?? targetProperty.value.width}
        onChange={setter('width')}
        onBlur={() => setInternalValue({ ...internalValue, width: null })}
        error={internalValue.width !== null}
      />
      <InputBase
        id={`input-${name}-height`}
        sx={(theme) => ({
          width: `calc(${(inputWidth / 2)}px - ${theme.spacing(0.25)})`,
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          '&:hover': { backgroundColor: 'action.selected' },
          '&:focus-within': { outline: `1px solid ${theme.palette.primary.main}` },
        })}
        inputProps={{
          sx: {
            p: 0,
            fontSize: 12,
          },
          spellCheck: false,
        }}
        value={internalValue.height ?? targetProperty.value.height}
        onChange={setter('height')}
        onBlur={() => setInternalValue({ ...internalValue, height: null })}
        error={internalValue.height !== null}
      />
    </Box>
  )
})

export default SizeInput
