import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { PANEL_WIDTH } from './config'
import StringInput from '../inputs/StringInput'
import Vector2Input from '../inputs/Vector2Input'
import SizeInput from '../inputs/SizeInput'
import FloatInput from '../inputs/FloatInput'
import IntegerInput from '../inputs/IntegerInput'

const INPUT_WIDTH = PANEL_WIDTH - 100
const inputClasses = {
  String: StringInput,
  Vector2: Vector2Input,
  Size: SizeInput,
  Float: FloatInput,
  Integer: IntegerInput,
}

const Contents = observer(({ numSelected, selectedItem }) => {
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
      {selectedItem.editables.map((propertyName) => {
        const property = selectedItem[propertyName]
        const name = propertyName.startsWith('_') ? propertyName.slice(1) : propertyName

        const ComponentClass = inputClasses[property.typeName]
        if (ComponentClass == null) return null

        const componentProps = {
          key: `${selectedItem.id}-${propertyName}`,
          width: INPUT_WIDTH,
          name,
          targetProperty: property,
        }
        return <ComponentClass {...componentProps} />
      })}
    </Box>
  )
})

export default Contents
