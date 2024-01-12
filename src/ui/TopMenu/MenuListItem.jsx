import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const MenuListItem = ({
  children,
  hotkey,
  hotkeyModifiers = [],
  HotkeyIcon,
  IconClass,
  icon,
  disabled = false,
  onClick,
}) => (
  <MenuItem disabled={disabled} onClick={onClick}>
    <Box
      sx={(theme) => ({
        width: theme.spacing(2),
        height: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
        marginRight: 2,
      })}
    >
      {IconClass && <IconClass sx={{ width: '16px', height: '16px', color: 'text.secondary' }} />}
      {icon}
    </Box>
    <ListItemText>{children}</ListItemText>
    {hotkey && hotkeyModifiers.map((hotkeyModifier) => (
      <Typography
        key={hotkeyModifier}
        variant="body2"
        color="text.secondary"
        sx={hotkeyModifier === '^' ? { fontFamily: 'monospace' } : {}}
      >
        {hotkeyModifier}
      </Typography>
    ))}
    {hotkey && (
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        {hotkey}
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
