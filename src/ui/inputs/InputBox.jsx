import { observer } from 'mobx-react-lite'
import InputBase from '@mui/material/InputBase'

const InputBox = observer(({
  availableWidth,
  halfWidth = false,
  label,
  value,
  setValue,
  onBlur,
  error,
}) => (
  <InputBase
    id={`input-${label}`}
    sx={(theme) => {
      let width = availableWidth
      if (halfWidth) {
        width = `calc(${(availableWidth / 2)}px - ${theme.spacing(0.25)})`
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
    onBlur={onBlur}
    error={error}
  />
))

export default InputBox
