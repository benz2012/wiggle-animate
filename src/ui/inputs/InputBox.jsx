import { useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'

const InputBox = observer(({
  availableWidth,
  totalBoxes = 1,
  halfWidth = false, // this allows overwriting the totalBoxes value
  iconInTheGap = false,
  label,
  labelGroup,
  value,
  setValue,
  incrementValue,
  addDragBox,
  valueDragRatio = 1, // the higher the ratio, the slower a value will change during drag-updates
  onBlur,
  error,
  autoFocus = false,
}) => {
  const inputId = `input-${labelGroup ? `${labelGroup}-` : ''}${label}`

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        if (event.shiftKey) {
          incrementValue(10)
        } else {
          incrementValue(1)
        }
        break
      case 'ArrowDown':
        if (event.shiftKey) {
          incrementValue(-10)
        } else {
          incrementValue(-1)
        }
        break
      case 'Enter':
        document.getElementById(inputId).blur()
        break
      default:
        break
    }
  }

  let dragButtonLabel = label.charAt(0)
  if (label === 'opacity') {
    dragButtonLabel = '%'
  } else if (totalBoxes > 1) {
    const subPropLabelParts = label.split('-')
    const subPropLabelLastBit = subPropLabelParts[subPropLabelParts.length - 1]
    dragButtonLabel = subPropLabelLastBit.charAt(0)
  }

  const [isDragging, setIsDragging] = useState(false)
  const valueAtDragStart = useRef(0)
  const dragStartX = useRef(0)

  const handlePointerMove = (moveEvent) => {
    const relativeOffsetX = moveEvent.clientX - dragStartX.current

    const potentialFloat = parseFloat(valueAtDragStart.current)
    if (!Number.isNaN(potentialFloat)) {
      const sigFigsNeeded = `${valueDragRatio}`.length - 1
      const relativeOffsetScaled = parseInt(relativeOffsetX, 10) / valueDragRatio

      const newValue = potentialFloat + relativeOffsetScaled
      const newValueSimplified = newValue.toFixed(sigFigsNeeded)

      const simulatedEvent = { target: { value: newValueSimplified } }
      setValue(simulatedEvent)
    }
  }

  const startDrag = (event) => {
    valueAtDragStart.current = value
    dragStartX.current = event.clientX
    setIsDragging(true)

    window.addEventListener('pointermove', handlePointerMove)
    const handleStopDrag = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handleStopDrag)
      setIsDragging(false)
    }
    window.addEventListener('pointerup', handleStopDrag)
  }

  return (
    <InputBase
      id={inputId}
      className="noselect"
      sx={(theme) => {
        const gapSizeGeneric = 0.5
        const gapSizeStr = theme.spacing(gapSizeGeneric)
        const gapSize = parseFloat(gapSizeStr.substring(0, gapSizeStr.length - 2))
        let numGaps = totalBoxes - 1
        let iconWidth = 0
        if (iconInTheGap) {
          numGaps += 1
          iconWidth = 24
        }

        let width = (availableWidth - (gapSize * numGaps) - (iconWidth)) / totalBoxes
        if (halfWidth) {
          width = (availableWidth - (gapSize * 1)) / 2
        }

        const focusedOutline = `1px solid ${theme.palette.primary.main}`
        return ({
          width,
          bgcolor: 'action.hover',
          borderRadius: 1,
          padding: 0,
          pr: 0.5,
          pl: addDragBox ? 0 : 0.5,
          py: addDragBox ? 0 : 0.5,
          outline: isDragging ? focusedOutline : 'inherit',
          '&:hover': { backgroundColor: 'action.selected' },
          '&:focus-within': { outline: focusedOutline },
          '&.Mui-error': { outline: `1px solid ${theme.palette.error.main}` },
        })
      }}
      inputProps={{
        className: 'noselect',
        sx: {
          p: 0,
          textIndent: addDragBox ? '4px' : 0,
          fontSize: 12,
          height: 16,
          fontFamily: 'monospace',
          '&::selection': { backgroundColor: 'action.disabled' },
          '&:focus::selection': { backgroundColor: 'rgb(111, 141, 176)' },
        },
        spellCheck: false,
      }}
      startAdornment={addDragBox && (
        <Box
          onPointerDown={startDrag}
          sx={(theme) => ({
            px: 0.5,
            pb: '1px',
            borderRadius: `${theme.spacing(0.5)} 0 0 ${theme.spacing(0.5)}`,

            fontSize: '10px',
            lineHeight: '23px',
            fontFamily: dragButtonLabel === '%' ? 'inherit' : 'monospace',
            color: isDragging ? theme.palette.primary.main : theme.palette.action.disabled,
            backgroundColor: theme.palette.mode === 'dark'
              ? ('rgb(20, 20, 20)') : (theme.palette.action.disabledBackground),

            cursor: 'ew-resize',
            '&:hover': { color: theme.palette.action.active },
          })}
        >
          {dragButtonLabel}
        </Box>
      )}
      value={value}
      onChange={setValue}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      error={error}
      autoFocus={autoFocus}
    />
  )
})

export default InputBox
