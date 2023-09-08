import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'

import { PANEL_WIDTH } from './config'
import Vector2Input from '../inputs/Vector2Input'

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box
        /* This is exclusivley a Text-type property line item */
        sx={{ display: 'flex', alignItems: 'center' }}
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
      {selectedItem.editables.map((propertyName) => {
        const property = selectedItem[propertyName]
        const name = propertyName.startsWith('_') ? propertyName.slice(1) : propertyName
        if (property.typeName === 'Vector2') {
          return (
            <Vector2Input
              key={`${selectedItem.id}-${propertyName}`}
              width={INPUT_WIDTH}
              name={name}
              targetProperty={property}
            />
          )
        }
        return null
      })}
    </Box>
  )
})

export default Contents
