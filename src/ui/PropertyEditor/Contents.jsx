import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import {
  PANEL_WIDTH,
  EXPANSION_DURATION,
  INITIALLY_COLLAPSED_GROUPS,
  PAIRED_VECTOR_TYPES,
  NO_DRAG_BOX_TYPES,
} from './config'
import PropertyGroup from './PropertyGroup'
import usePrevious from '../hooks/usePrevious'
import { weightLabelMap } from '../../utility/fonts'

import AlignmentInput from '../inputs/AlignmentInput'
import AngleInput from '../inputs/AngleInput'
import ButtonAction from '../inputs/ButtonAction'
import ColorInput from '../inputs/ColorInput'
import FloatInput from '../inputs/FloatInput'
import IntegerInput from '../inputs/IntegerInput'
import SelectionInput from '../inputs/SelectionInput'
import SizeInput from '../inputs/SizeInput'
import StringInput from '../inputs/StringInput'
import Vector2Input from '../inputs/Vector2Input'

const INPUT_WIDTH = PANEL_WIDTH - 100
const inputClasses = {
  Alignment: AlignmentInput,
  Angle: AngleInput,
  Color: ColorInput,
  Float: FloatInput,
  Integer: IntegerInput,
  Selection: SelectionInput,
  Size: SizeInput,
  String: StringInput,
  Vector2: Vector2Input,
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

  const groupAdditions = {
    font: [
      <ButtonAction key="open-add-fonts" onClick={() => store.openDialog('addFonts')}>
        + Add Fonts
      </ButtonAction>,
    ],
  }

  const genericSetter = (property) => (newValue) => {
    if (property.name === '_origin') {
      const newValueVector = property.castAndCoerceValue(newValue)
      selectedItem.setOrigin(newValueVector, store.animation.now)
    } else {
      property.setValue(newValue, store.animation.now)
    }

    // This is fairly hacky but I need a way to link all 3 font selection boxes to one another, sad :(
    if (property.typeName === 'Selection' && property.value.specialType === '_fontFamily') {
      const nextFontStyles = []
      const nextFontWeights = []
      store.project.fonts
        .filter((font) => font.name === newValue)
        .forEach((font) => {
          nextFontStyles.push(font.style)
          nextFontWeights.push(weightLabelMap[font.weight])
        })
      selectedItem._fontStyle.value.setNewValues([...new Set(nextFontStyles)], 'normal')
      selectedItem._fontWeight.value.setNewValues([...new Set(nextFontWeights)], weightLabelMap[400])
    }
  }

  const makePropertyComponent = (property) => {
    const ComponentClass = inputClasses[property.typeName]
    if (ComponentClass == null) return null

    // Enable Color to also edit Opacity
    // This requires all `Color` properties to have a matching `Opacity`
    // For example: `_fillColor` --> `_fillOpacity`
    let secondaryProperty = null
    if (property.name.toLowerCase().includes('color')) {
      const opacityRelatedToThisColor = property.name.replace('Color', 'Opacity')
      secondaryProperty = selectedItem[opacityRelatedToThisColor]
    }

    const propertyKey = `${selectedItem.id}-${property.label}`
    let pairVector = false
    if (PAIRED_VECTOR_TYPES.includes(property.label)) {
      const valueInStore = store.propertyEditor.pairedVectors[propertyKey]
      pairVector = valueInStore == null || valueInStore === true
    }
    const togglePairing = (shouldPair) => {
      store.setPairedVector(propertyKey, shouldPair)
    }

    const componentProps = {
      key: propertyKey,
      availableWidth: INPUT_WIDTH,
      label: property.label,
      labelGroup: property.group,
      targetProperty: property,
      setPropertyValue: genericSetter(property),
      secondaryProperty,
      setSecondaryPropertyValue: genericSetter(secondaryProperty),
      pairVector,
      togglePairing,
      addDragBox: !NO_DRAG_BOX_TYPES.includes(property.typeName),
      valueDragRatio: property.valueDragRatio,
    }
    return <ComponentClass {...componentProps} />
  }

  const makeGroupConfig = (groupName) => ({
    isGroup: true,
    groupName,
    contents: [],
    initiallyCollapsed: INITIALLY_COLLAPSED_GROUPS.includes(groupName),
  })

  const makePropertyGroup = (propertyGroup) => {
    const { groupName, contents, initiallyCollapsed } = propertyGroup
    const thisItemGroup = `${selectedItem.id}-${groupName}`

    let show = true
    if (thisItemGroup in store.propertyEditor.hiddenGroups) {
      show = store.propertyEditor.hiddenGroups[thisItemGroup] === false
    } else if (initiallyCollapsed) {
      show = false
    }

    const toggleGroup = (shouldShow) => {
      if (shouldShow) {
        store.showPropertyGroup(thisItemGroup)
      } else {
        store.hidePropertyGroup(thisItemGroup)
      }
    }

    let additionsToRender = null
    if (groupName in groupAdditions) {
      additionsToRender = groupAdditions[groupName]
    }

    return (
      <PropertyGroup key={`group-${groupName}`} name={groupName} show={show} toggleGroup={toggleGroup}>
        {contents.map(makePropertyComponent)}
        {additionsToRender}
      </PropertyGroup>
    )
  }

  const editableProperties = selectedItem.editables.map((propertyName) => selectedItem[propertyName])
  const sortedProperties = editableProperties.sort((a, b) => (a.order - b.order))
  const groupedProperties = sortedProperties.reduce((finalList, property) => {
    const { group } = property
    if (group != null) {
      let existingGroupIndex = finalList.findIndex((element) => (
        element.isGroup && element.groupName === group
      ))
      if (existingGroupIndex === -1) {
        const newLength = finalList.push(makeGroupConfig(group))
        existingGroupIndex = newLength - 1
      }
      finalList[existingGroupIndex].contents.push(property)
    } else {
      finalList.push(property)
    }
    return finalList
  }, [])
  const listOfComponents = groupedProperties.map((property) => (
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
