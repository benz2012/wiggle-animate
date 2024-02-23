import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'

import InputLabel from '../../inputs/InputLabel'

const TransparencyInput = observer(({ store, availableWidth }) => {
  const handleChange = (event) => {
    const prevValue = store.stage.transparent
    const newValue = event.target.checked
    store.stage.setTransparency(newValue)
    store.actionStack.push({
      revert: ['stage.setTransparency', [prevValue]],
      perform: ['stage.setTransparency', [newValue]],
    })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <InputLabel label="transparent" />
      <Switch
        id="input-transparent"
        color="primary"
        checked={store.stage.transparent}
        onChange={handleChange}
        sx={{
          width: `${Math.floor(availableWidth / 3) - 2}px`,
          height: '24px',
          padding: 0,
          overflow: 'visible',

          '& .MuiSwitch-switchBase': {
            padding: '4px',
            transform: 'translateX(0px) !important',
          },
          '& .Mui-checked': { transform: 'translateX(40px) !important' },

          '& .MuiSwitch-track': {
            height: '24px',
            borderRadius: '24px',
          },
          '& .MuiSwitch-thumb': {
            boxShadow: 'none',
            width: 16,
            height: 16,
          },
        }}
      />
    </Box>
  )
})

export default TransparencyInput
