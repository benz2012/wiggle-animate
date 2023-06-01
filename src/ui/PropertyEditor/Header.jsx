import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import SettingsIcon from '@mui/icons-material/Settings'

const Header = ({ expanded, setExpanded, startDrag, isDragging }) => (
  <>
    <button type="button" className="button-style-reset" onClick={() => setExpanded(!expanded)}>
      <Box
        sx={{
          pr: 1,
          color: 'text.icon',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <ExpandMoreIcon
          sx={(theme) => ({
            transition: `transform ${theme.transitions.duration.shorter}ms,
              color ${theme.transitions.duration.shortest}ms`,
            transform: !expanded && 'rotate(-90deg)',
          })}
        />
      </Box>
    </button>

    <Box
      sx={(theme) => ({
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        transition: `color ${theme.transitions.duration.shortest}ms`,
        color: 'text.icon',
        '&:hover': { color: 'text.primary' },
      })}
    >
      <button
        type="button"
        className="button-style-reset"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', width: '100%' }}
        onPointerDown={startDrag}
      >
        <DragIndicatorIcon sx={{ transform: 'rotate(90deg)' }} />
      </button>
    </Box>

    <button type="button" className="button-style-reset">
      <Box
        sx={{
          pl: 1,
          color: 'text.icon',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <SettingsIcon
          fontSize="small"
          sx={(theme) => ({ transition: `color ${theme.transitions.duration.shortest}ms` })}
        />
      </Box>
    </button>
  </>
)

export default Header
