import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'

import { PANEL_WIDTH } from './config'

const INPUT_WIDTH = PANEL_WIDTH - 100

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

  // TODO: iterate over the editable props and display their type-based line items
  return (
    <Box sx={{}}>
      <Box
        /* This is exclusivley a Text-type property line item */
        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
      >
        <Typography
          component="label"
          htmlFor="input-name"
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
          id="input-name"
          sx={(theme) => ({
            width: INPUT_WIDTH,
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

      <Box
        /* This is exclusivley a Vector-type property line item */
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Typography
          component="label"
          htmlFor="input-position-x"
          sx={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: 'text.disabled',
            cursor: 'pointer',
            '&:hover': { color: 'text.secondary' },
          }}
        >
          position
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <InputBase
          id="input-position-x"
          sx={(theme) => ({
            width: `calc(${(INPUT_WIDTH / 2)}px - ${theme.spacing(0.5)})`,
            bgcolor: 'action.hover',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            mr: 1,
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
          value={selectedItem.position.value.x}
          onChange={(event) => {
            const { value } = event.target
            selectedItem.position.setValue([value, selectedItem.position.value.y])
          }}
        />
        <InputBase
          id="input-position-y"
          sx={(theme) => ({
            width: `calc(${(INPUT_WIDTH / 2)}px - ${theme.spacing(0.5)})`,
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
          value={selectedItem.position.value.y}
          onChange={(event) => {
            const { value } = event.target
            selectedItem.position.setValue([selectedItem.position.value.x, value])
          }}
        />
      </Box>
    </Box>
  )
})

export default Contents
