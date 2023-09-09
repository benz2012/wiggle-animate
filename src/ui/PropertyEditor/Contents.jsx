import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { PANEL_WIDTH, EXPANSION_DURATION } from './config'
import usePrevious from '../hooks/usePrevious'
import StringInput from '../inputs/StringInput'
import Vector2Input from '../inputs/Vector2Input'
import SizeInput from '../inputs/SizeInput'
import FloatInput from '../inputs/FloatInput'
import IntegerInput from '../inputs/IntegerInput'
import AngleInput from '../inputs/AngleInput'

const INPUT_WIDTH = PANEL_WIDTH - 100
const inputClasses = {
  String: StringInput,
  Vector2: Vector2Input,
  Size: SizeInput,
  Float: FloatInput,
  Integer: IntegerInput,
  Angle: AngleInput,
}

const Contents = observer(({ numSelected, selectedItem }) => {
  const [contentOpacity, setContentOpacity] = useState(1)
  const prevNumSelected = usePrevious(numSelected)
  useEffect(() => {
    if (prevNumSelected !== 1 && numSelected === 1) {
      setContentOpacity(0)
      setTimeout(() => { setContentOpacity(1) })
    } else {
      setContentOpacity(0)
    }
  }, [numSelected])

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        transition: contentOpacity === 1 ? `opacity ${EXPANSION_DURATION - 50}ms 50ms` : '',
        opacity: contentOpacity,
      }}
    >
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
