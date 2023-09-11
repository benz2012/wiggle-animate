import { observer } from 'mobx-react-lite'
import InputBase from '@mui/material/InputBase'

const InputBox = observer(({
  availableWidth,
  totalBoxes = 1,
  halfWidth = false, // this allows overwriting the totalBoxes value
  label,
  value,
  setValue,
  incrementValue,
  onBlur,
  error,
}) => {
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        if (event.shiftKey) {
          incrementValue(10)
        } else {
          incrementValue(1)
        }
        break
      case 'ArrowDown':
        if (event.shiftKey) {
          incrementValue(-10)
        } else {
          incrementValue(-1)
        }
        break
      default:
        break
    }
  }

  return (
    <InputBase
      id={`input-${label}`}
      sx={(theme) => {
        const gapSizeGeneric = 0.5
        const gapSizeStr = theme.spacing(gapSizeGeneric)
        const gapSize = parseFloat(gapSizeStr.substring(0, gapSizeStr.length - 2))

        const numGaps = totalBoxes - 1
        let width = (availableWidth - (gapSize * numGaps)) / totalBoxes
        if (halfWidth) {
          width = (availableWidth - (gapSize * 1)) / 2
        }

        return ({
          width,
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          '&:hover': { backgroundColor: 'action.selected' },
          '&:focus-within': { outline: `1px solid ${theme.palette.primary.main}` },
          '&.Mui-error': { outline: `1px solid ${theme.palette.error.main}` },
        })
      }}
      inputProps={{
        sx: {
          p: 0,
          fontSize: 12,
          fontFamily: 'monospace',
        },
        spellCheck: false,
      }}
      value={value}
      onChange={setValue}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      error={error}
    />
  )
})

export default InputBox
