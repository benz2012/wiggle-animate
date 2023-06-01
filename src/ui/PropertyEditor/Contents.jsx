import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'

import { PANEL_WIDTH } from './config'

const Contents = observer(({ numSelected, selectedItem, setter }) => {
  if (numSelected !== 1) {
    let text = ''
    if (numSelected === 0) {
      text = 'Select an item'
    } else if (numSelected > 1) {
      text = 'Select only one item'
    }
    return (
      <Typography
        align="center"
        color="action.disabled"
        sx={{ fontSize: 12, textTransform: 'uppercase', py: 0.5, letterSpacing: 0.75 }}
      >
        {text}
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* TODO: iterate over the editable props and display their type-based line items */}

      {/* This is exclusivley a Text-type property line item */}
      <Typography
        component="label"
        htmlFor="name-input"
        sx={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'text.disabled',
          cursor: 'pointer',
          '&:hover': { color: 'text.secondary' },
        }}
      >
        name
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <InputBase
        id="name-input"
        sx={(theme) => ({
          width: PANEL_WIDTH - 100,
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          '&:hover': { backgroundColor: 'action.selected' },
          '&:focus-within': { outline: `1px solid ${theme.palette.primary.main}` },
        })}
        inputProps={{
          sx: {
            p: 0,
            fontSize: 12,
          },
          spellCheck: false,
        }}
        value={selectedItem.name ?? ''}
        onChange={setter}
      />

    </Box>
  )
})

export default Contents
