import Box from '@mui/material/Box'
import Backdrop from '@mui/material/Backdrop'
import { RgbaColorPicker } from 'react-colorful'

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
    onClick={(event) => {
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
        left: 20,
        zIndex: theme.zIndex.modal + 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        gap: theme.spacing(0.5),
      })}
    >
      <RgbaColorPicker color={color} onChange={setColor} />
    </Box>
  </Backdrop>
)

export {
  ColorBox,
  ColorPicker,
}
