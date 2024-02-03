import { useEffect } from 'react'
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

const ColorPicker = ({ color, setColor, close, autoFocus = true }) => {
  useEffect(() => {
    // The goal is that this will only run once when the element is rendered
    // however, to make it future proof, we should pass in an open/close prop
    // since "one initial render" is no longer gaurunteed
    if (!autoFocus) return
    // TODO [1]: figure out how to make these elements the activeElemnets. Doesn't need to be "focused" per-se
    //           but I need to route key events to this after I call the following lines
    setTimeout(() => {
      const colorPickerPicker = document.getElementById('color-picker-picker')
      if (!colorPickerPicker) return
      colorPickerPicker.focus()
    }, 1500)
  }, [autoFocus])

  return (
    <Backdrop
      open
      onPointerDown={(event) => {
        if (`${event.target.className}`.toLowerCase().includes('backdrop')) {
          close()
        }
      }}
      onKeyDown={(event) => {
        // TODO [1]: check these keywords on MDN
        // NOTE: Here are some key actions that live outside of the KeyHandler since the
        //       Colorpicker open-state would be extra complicatcated if controlled globally
        if (['Escape', 'Enter'].includes(event.key)) {
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
        <RgbaColorPicker id="color-picker-picker" color={color} onChange={setColor} />
      </Box>
    </Backdrop>
  )
}

export {
  ColorBox,
  ColorPicker,
}
