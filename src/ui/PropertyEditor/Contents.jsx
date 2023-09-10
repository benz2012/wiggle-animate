import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { PANEL_WIDTH, EXPANSION_DURATION } from './config'
import GroupHeading from './GroupHeading'
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

const Contents = observer(({ store, numSelected, selectedItem }) => {
  const [contentOpacity, setContentOpacity] = useState(1)
  const prevNumSelected = usePrevious(numSelected)
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
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

  const genericSetter = (property) => (newValue) => {
    property.setValue(newValue, store.animation.now)
  }

  const makePropertyComponent = (property) => {
    const ComponentClass = inputClasses[property.typeName]
    if (ComponentClass == null) return null

    const componentProps = {
      key: `${selectedItem.id}-${property.label}`,
      width: INPUT_WIDTH,
      label: property.label,
      targetProperty: property,
      setProperty: genericSetter(property),
    }
    return <ComponentClass {...componentProps} />
  }

  const makePropertyGroup = (propertyGroup) => {
    const { groupName, contents } = propertyGroup
    const thisItemGroup = `${selectedItem.id}-${groupName}`

    const show = !store.propertyEditor.hiddenGroups[thisItemGroup]
    const toggleGroup = (shouldShow) => {
      if (shouldShow) {
        store.showPropertyGroup(thisItemGroup)
      } else {
        store.hidePropertyGroup(thisItemGroup)
      }
    }

    return (
      <GroupHeading key={`group-${groupName}`} name={groupName} show={show} toggleGroup={toggleGroup}>
        {contents.map(makePropertyComponent)}
      </GroupHeading>
    )
  }

  const editableProperties = selectedItem.editables.map((propertyName) => selectedItem[propertyName])
  const orderedGroupedProperties = editableProperties.reduce((finalList, property) => {
    const { group } = property
    if (group != null) {
      let existingGroupIndex = finalList.findIndex((element) => (
        element.isGroup && element.groupName === group
      ))
      if (existingGroupIndex === -1) {
        const newLength = finalList.push({ isGroup: true, groupName: group, contents: [] })
        existingGroupIndex = newLength - 1
      }
      finalList[existingGroupIndex].contents.push(property)
    } else {
      finalList.push(property)
    }
    return finalList
  }, [])
  const listOfComponents = orderedGroupedProperties.map((property) => (
    property.isGroup ? makePropertyGroup(property) : makePropertyComponent(property)
  ))

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
      {listOfComponents}
    </Box>
  )
})

export default Contents
