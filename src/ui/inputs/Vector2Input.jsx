import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'

const Vector2Input = observer(({ width, label, targetProperty, setProperty }) => {
  // The internal value allows us to track invalid strings in the input
  // box, without corrupting the value of the targetProperty.
  // When one is set, it indicates that the inputbox is in an error state
  const [internalValue, setInternalValue] = useState({
    x: null,
    y: null,
  })

  const setter = (subProp) => (event) => {
    const { value } = event.target

    const potentialFloat = parseFloat(value)
    if (
      Number.isNaN(potentialFloat)
      || value.endsWith('.')
      || `${potentialFloat}`.length !== value.length
    ) {
      setInternalValue({ ...internalValue, [subProp]: value })
      return
    }

    if (subProp === 'x') {
      setProperty([potentialFloat, targetProperty.value.y])
    } else if (subProp === 'y') {
      setProperty([targetProperty.value.x, potentialFloat])
    }
    setInternalValue({ ...internalValue, [subProp]: null })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        component="label"
        htmlFor={`input-${label}-x`}
        sx={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'text.disabled',
          cursor: 'pointer',
          '&:hover': { color: 'text.secondary' },
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <InputBase
        id={`input-${label}-x`}
        sx={(theme) => ({
          width: `calc(${(width / 2)}px - ${theme.spacing(0.25)})`,
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
            fontFamily: 'monospace',
          },
          spellCheck: false,
        }}
        value={internalValue.x ?? targetProperty.value.x}
        onChange={setter('x')}
        onBlur={() => setInternalValue({ ...internalValue, x: null })}
        error={internalValue.x !== null}
      />
      <InputBase
        id={`input-${label}-y`}
        sx={(theme) => ({
          width: `calc(${(width / 2)}px - ${theme.spacing(0.25)})`,
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
            fontFamily: 'monospace',
          },
          spellCheck: false,
        }}
        value={internalValue.y ?? targetProperty.value.y}
        onChange={setter('y')}
        onBlur={() => setInternalValue({ ...internalValue, y: null })}
        error={internalValue.y !== null}
      />
    </Box>
  )
})

export default Vector2Input
