import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'

const FloatInput = observer(({ width, name, targetProperty }) => {
  // The internal value allows us to track invalid strings in the input
  // box, without corrupting the value of the targetProperty.
  // When one is set, it indicates that the inputbox is in an error state
  const [internalValue, setInternalValue] = useState(null)

  const setter = (event) => {
    const { value } = event.target

    const potentialFloat = parseFloat(value)
    if (
      Number.isNaN(potentialFloat)
      || value.endsWith('.')
      || `${potentialFloat}`.length !== value.length
    ) {
      setInternalValue(value)
      return
    }

    targetProperty.setValue(potentialFloat)
    setInternalValue(null)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        component="label"
        htmlFor={`input-${name}`}
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
        id={`input-${name}`}
        sx={(theme) => ({
          width: `calc(${(width / 2)}px - ${theme.spacing(0.25)})`,
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1,
          py: 0.5,
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
        value={internalValue ?? targetProperty.value}
        onChange={setter}
        onBlur={() => setInternalValue(null)}
        error={internalValue !== null}
      />
    </Box>
  )
})

export default FloatInput