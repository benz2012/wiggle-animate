import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

const PropertyGroup = observer(({ name, show, toggleGroup, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          ml: -0.5,
          cursor: 'pointer',
          color: 'text.disabled',
          '&:hover': { color: 'text.secondary' },
        }}
        onClick={() => toggleGroup(!show)}
      >
        <ArrowDropDownIcon
          fontSize="small"
          sx={(theme) => ({
            transition: `transform ${theme.transitions.duration.shortest}ms`,
            transform: show ? '' : 'rotate(-90deg)',
          })}
        />
        <Typography
          className="noselect"
          variant="caption"
          sx={{ fontFamily: 'monospace' }}
        >
          {/* children is expected as [[list of property inputs], [list of special stuff]] */}
          {name}{show ? '' : `  (${children[0].length})`}
        </Typography>
      </Box>
      <Divider sx={{ ml: 1, flexGrow: 1 }} />
    </Box>
    {show && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {children}
      </Box>
    )}
  </Box>
))

export default PropertyGroup
