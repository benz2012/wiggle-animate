import { observer } from 'mobx-react-lite'
import Typography from '@mui/material/Typography'

const InputLabel = observer(({ label, hasSubProp }) => (
  <Typography
    component="label"
    htmlFor={`input-${label}`}
    sx={{
      fontFamily: 'monospace',
      fontSize: 12,
      color: 'text.disabled',
      cursor: 'pointer',
      '&:hover': { color: 'text.secondary' },
    }}
  >
    {hasSubProp ? label.split('-')[0] : label}
  </Typography>
))

export default InputLabel
