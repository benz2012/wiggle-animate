import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import InputLabel from './InputLabel'

const SelectionInput = observer(({
  availableWidth,
  targetProperty,
  setPropertyValue,
  noKeyframeGap,
  disabled,
}) => {
  const { value: selectionObj, label, group } = targetProperty

  const handleChange = (event) => {
    const { value: newValue } = event.target
    setPropertyValue(newValue)

    // This forces the debounce listener to still capture the leading-edge and trailing-edge
    const immediatelySubmitAction = true
    setPropertyValue(newValue, immediatelySubmitAction)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* gap that mimics keyframe button for proper left alignment of labels */}
      {!noKeyframeGap && <Box sx={{ marginRight: '16px' }} />}

      <InputLabel label={label} labelGroup={group} idInsteadOfFor />

      <Box sx={{ flexGrow: 1 }} />

      <Select
        labelId={`input-${group ? `${group}-` : ''}${label}`}
        value={selectionObj.selected}
        onChange={handleChange}
        disabled={disabled}
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
