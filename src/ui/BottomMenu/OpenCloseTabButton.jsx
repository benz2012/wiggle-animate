import ButtonBase from '@mui/material/ButtonBase'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import './BottomMenu.css'
import myTheme from '../theme'

const OpenCloseTabButton = ({ open, setOpen }) => (
  <ButtonBase
    id="bottom-menu-tab"
    onClick={() => setOpen(!open)}
    focusRipple
    sx={{
      backgroundColor: open ? `${myTheme.palette.background.main}` : `${myTheme.palette.primary_dark[20]}`,
      '&:hover': {
        backgroundColor: open
          ? `${myTheme.palette.background.lighter1}`
          : `${myTheme.palette.primary_dark[30]}`,
      },
      '&:active': {
        backgroundColor: open
          ? `${myTheme.palette.background.lighter1}`
          : `${myTheme.palette.primary_dark[30]}`,
      },
    }}
  >
    <KeyboardArrowUpIcon
      sx={(theme) => ({
        transition: `transform ${theme.transitions.duration.shorter}ms`,
        transform: open && 'rotate(180deg)',
      })}
    />
  </ButtonBase>
)

export default OpenCloseTabButton
