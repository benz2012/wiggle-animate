import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Backdrop from '@mui/material/Backdrop'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { RgbaColorPicker, RgbColorPicker } from 'react-colorful'

const ColorBox = ({ color, onClick, disabled }) => (
  <Box
    onClick={(event) => {
      if (disabled) return
      onClick(event)
    }}
    sx={(theme) => ({
      width: theme.spacing(1),
      height: 24,
      mr: 0.5,
      borderRadius: 1,
      backgroundColor: color,
      cursor: disabled ? 'inherit' : 'pointer',
      '&:hover': (disabled ? {} : { outline: `1px solid ${theme.palette.primary.main}` }),
    })}
  />
)

const ColorPicker = ({ color, setColor, close, excludeAlpha = false, autoFocus = true }) => {
  useEffect(() => {
    if (!autoFocus) return
    const colorPickerPicker = document.getElementById('color-picker-picker')
    if (!colorPickerPicker) return
    colorPickerPicker.focus()
  }, [autoFocus])

  const sharedProps = {
    id: 'color-picker-picker',
    tabIndex: -1,
    style: { outline: 'none' },
    color,
    onChange: setColor,
  }

  return (
    <Backdrop
      open
      onPointerDown={(event) => {
        if (`${event.target.className}`.toLowerCase().includes('backdrop')) {
          close()
        }
      }}
      onKeyDown={(event) => {
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
        {excludeAlpha ? (
          <RgbColorPicker {...sharedProps} />
        ) : (
          <RgbaColorPicker {...sharedProps} />
        )}
      </Box>
    </Backdrop>
  )
}

export {
  ColorBox,
  ColorPicker,
}
