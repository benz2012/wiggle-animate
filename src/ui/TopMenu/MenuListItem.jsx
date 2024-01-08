import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// TODO [2]: Determine Ctrl or Cmd depending on OS

const MenuListItem = ({
  children,
  hotkey,
  HotkeyIcon,
  IconClass,
  onClick,
}) => (
  <MenuItem onClick={onClick}>
    <Box
      sx={(theme) => ({
        width: theme.spacing(2),
        height: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
        marginRight: 2,
      })}
    >
      <IconClass sx={{ width: '16px', height: '16px' }} />
    </Box>
    <ListItemText>{children}</ListItemText>
    {hotkey && (
      <Typography variant="body2" color="text.secondary">
        ⌘{hotkey}
      </Typography>
    )}
    {HotkeyIcon && (
      <Box
        sx={(theme) => ({
          width: theme.spacing(2),
          height: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        })}
      >
        <HotkeyIcon sx={{ width: '16px', height: '16px', color: 'text.secondary' }} />
      </Box>
    )}
  </MenuItem>
)

export default MenuListItem
