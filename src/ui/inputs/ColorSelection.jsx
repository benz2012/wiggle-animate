import Box from '@mui/material/Box'
import Backdrop from '@mui/material/Backdrop'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { RgbaColorPicker } from 'react-colorful'

import { PANEL_WIDTH } from '../PropertyEditor/config'

const ColorBox = ({ color, onClick }) => (
  <Box
    onClick={onClick}
    sx={(theme) => ({
      width: theme.spacing(1),
      height: 24,
      mr: 0.5,
      borderRadius: 1,
      backgroundColor: color,
      cursor: 'pointer',
      '&:hover': { outline: `1px solid ${theme.palette.primary.main}` },
    })}
  />
)

const ColorPicker = ({ color, setColor, close }) => (
  <Backdrop
    open
    onPointerDown={(event) => {
      if (`${event.target.className}`.toLowerCase().includes('backdrop')) {
        close()
      }
    }}
    sx={(theme) => ({
      position: 'absolute',
      zIndex: theme.zIndex.modal,
    })}
  >
    <Box
      sx={(theme) => ({
        position: 'absolute',
        left: (PANEL_WIDTH - 200) / 2,
        zIndex: theme.zIndex.modal + 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        gap: theme.spacing(0.5),
      })}
    >
      <Box
        onPointerDown={close}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <IconButton size="small" onClick={close}><CloseIcon /></IconButton>
      </Box>
      <RgbaColorPicker color={color} onChange={setColor} />
    </Box>
  </Backdrop>
)

export {
  ColorBox,
  ColorPicker,
}
