import Checkbox from '@mui/material/Checkbox'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'

const CheckboxLock = ({ checked, onChange }) => (
  <Checkbox
    icon={<LockOpenIcon />}
    checkedIcon={<LockIcon />}
    size="4px"
    sx={(theme) => ({
      color: 'action.disabled',
      '&.MuiCheckbox-root': {
        padding: theme.spacing(0.5),
        margin: '0px',
      },
    })}
    checked={checked}
    onChange={onChange}
  />
)

export default CheckboxLock
