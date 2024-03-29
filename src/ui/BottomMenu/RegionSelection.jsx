/* eslint-disable react/no-array-index-key */
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LABEL_WIDTH } from './config'
import { Tick, Arrow, Dash } from './regionGraphics'
import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'
import usePrevious from '../hooks/usePrevious'

const mono12 = { fontFamily: 'monospace', fontSize: 12 }

const RegionSelection = observer(({
  frameIn,
  frameOut,
  animationRange,
  setIn,
  setOut,
  frameHoveredAt,
  absoluteFrameHovered,
}) => {
  const totalFramesShown = frameOut - frameIn + 1
  const percentHoveredAt = ((absoluteFrameHovered - frameIn) / (totalFramesShown - 1)) * 100
  const withinCloseRangeOfIn = percentHoveredAt < 10
  const withinCloseRangeOfOut = percentHoveredAt > 90
  const withinCloseRangeOfInOut = (withinCloseRangeOfIn || withinCloseRangeOfOut)
  const hoveringOverInOrOut = [frameIn, frameOut].includes(absoluteFrameHovered)

  const frameMarkerContainerWidth = 80
  let frameMarkerLeftAdjustment = -1 * (frameMarkerContainerWidth / 2)
  let frameMarkerTextAlign = 'center'
  if (withinCloseRangeOfIn) {
    frameMarkerLeftAdjustment = 0
    frameMarkerTextAlign = 'flex-start'
  } else if (withinCloseRangeOfOut) {
    frameMarkerLeftAdjustment *= 2
    frameMarkerTextAlign = 'flex-end'
  }

  const [editIn, setEditIn] = useState(false)
  const prevEditIn = usePrevious(editIn)
  const [editOut, setEditOut] = useState(false)
  const prevEditOut = usePrevious(editOut)

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    if (prevEditIn === false && editIn === true) {
      const editInInputBox = document.getElementById('input-editIn')
      if (editInInputBox) { editInInputBox.select() }
    } else if (prevEditOut === false && editOut === true) {
      const editOutInputBox = document.getElementById('input-editOut')
      if (editOutInputBox) { editOutInputBox.select() }
    }
  }, [editIn, editOut])

  const parseAndValidateFrameIn = (value) => {
    const validation = parseAndValidateInteger(value)
    if (validation.isValid && validation.parsedValue >= frameOut) {
      return { ...validation, isValid: false }
    }
    return validation
  }
  const parseAndValidateFrameOut = (value) => {
    const validation = parseAndValidateInteger(value)
    if (validation.isValid && validation.parsedValue <= frameIn) {
      return { ...validation, isValid: false }
    }
    return validation
  }

  return (
    <Box
      sx={(theme) => ({
        position: 'sticky',
        top: 0,
        pb: 1,
        pr: theme.spacing(2),
        zIndex: 900,
        backgroundColor: 'background.paper',
        display: 'flex',
        alignItems: 'flex-end',
      })}
    >
      <Box sx={(theme) => ({ width: `calc(${LABEL_WIDTH}px - ${theme.spacing(2)})`, mr: 2 })}>
        <Typography
          className="noselect"
          component="label"
          sx={{
            display: 'block',
            width: '100%',
            textAlign: 'right',
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: '8px',
            color: 'text.disabled',
          }}
        >
          WORK REGION
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            minHeight: '26px',
            pb: 0.5,
          }}
        >
          {editIn ? (
            <GenericInputWithInternalValue
              availableWidth={40}
              label="editIn"
              propertyValue={frameIn}
              parseAndValidateNewValue={parseAndValidateFrameIn}
              setPropertyValue={setIn}
              onBlur={() => setEditIn(false)}
              focusIdAfterCommitting="bottom-menu"
              noLabel
              autoFocus
            />
          ) : (
            <Typography
              className="noselect"
              tabIndex="0"
              sx={(theme) => ({
                ...mono12,
                cursor: 'pointer',
                borderBottom: `1px dotted ${theme.palette.action.disabled}`,
                '&:hover': {
                  color: 'primary.main',
                  borderBottom: `1px dotted ${theme.palette.primary.main}`,
                },
              })}
              onClick={() => setEditIn(true)}
              onFocus={() => setEditIn(true)}
            >
              {frameIn}
            </Typography>
          )}

          <Box sx={{ position: 'absolute', right: 0 }}>
            {editOut ? (
              <GenericInputWithInternalValue
                availableWidth={40}
                label="editOut"
                propertyValue={frameOut}
                parseAndValidateNewValue={parseAndValidateFrameOut}
                setPropertyValue={setOut}
                onBlur={() => setEditOut(false)}
                focusIdAfterCommitting="bottom-menu"
                noLabel
                autoFocus
              />
            ) : (
              <Typography
                className="noselect"
                tabIndex="0"
                sx={(theme) => ({
                  ...mono12,
                  cursor: 'pointer',
                  borderBottom: `1px dotted ${theme.palette.action.disabled}`,
                  '&:hover': {
                    color: 'primary.main',
                    borderBottom: `1px dotted ${theme.palette.primary.main}`,
                  },
                })}
                onClick={() => setEditOut(true)}
                onFocus={() => setEditOut(true)}
              >
                {frameOut}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {frameIn === animationRange[0] ? (<Tick />) : (<Arrow direction="left" />)}
          <Dash />
          {frameOut === animationRange[1] ? (<Tick />) : (<Arrow direction="right" />)}
          {(absoluteFrameHovered && !editIn && !editOut) && (
            <Box
              sx={{
                position: 'absolute',
                width: `${frameMarkerContainerWidth}px`,
                left: `${frameHoveredAt + frameMarkerLeftAdjustment}px`,
                bottom: '0px',

                display: 'flex',
                flexDirection: 'column',
                alignItems: frameMarkerTextAlign,
                justifyContent: 'center',
              }}
            >
              <Box
                sx={(theme) => ({
                  pl: 1,
                  pr: 1,
                  mb: '8px',
                  borderRadius: 1,
                  backgroundColor: withinCloseRangeOfInOut ? 'rgba(0, 0, 0, 0.75)' : '',
                  transition: `background-color ${theme.transitions.duration.standard}ms`,
                })}
              >
                <Typography className="noselect" sx={{ ...mono12 }}>
                  {absoluteFrameHovered}
                </Typography>
              </Box>
              <Tick sx={hoveringOverInOrOut ? { borderColor: 'transparent' } : {}} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
})

export default RegionSelection
