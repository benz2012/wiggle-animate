import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import InputLabel from './InputLabel'

const SelectionInput = observer(({
  availableWidth,
  targetProperty,
  setPropertyValue,
}) => {
  const { value: selectionObj, label, group } = targetProperty

  const handleChange = (event) => {
    const { value: newValue } = event.target
    setPropertyValue(newValue)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <InputLabel label={label} />

      <Box sx={{ flexGrow: 1 }} />

      <Select
        value={selectionObj.selected}
        onChange={handleChange}
        sx={(theme) => ({
          width: availableWidth,
          '& .MuiInputBase-input': {
            margin: '0px',
            padding: theme.spacing(0.25),
            paddingLeft: theme.spacing(1),
            fontSize: 12,
            fontFamily: 'monospace',
          },
        })}
      >
        {selectionObj.values.map((value) => (
          <MenuItem
            key={`${group}-${label}-menuitem-${value}`}
            value={value}
            sx={(theme) => ({
              fontSize: 12,
              fontFamily: 'monospace',
              padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
            })}
          >
            {value}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
})

export default SelectionInput
