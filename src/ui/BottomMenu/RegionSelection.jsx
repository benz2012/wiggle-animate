/* eslint-disable react/no-array-index-key */
import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LABEL_WIDTH } from './config'
import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'

const mono12 = { fontFamily: 'monospace', fontSize: 12 }

const Tick = ({ sx }) => (
  <Box
    sx={(theme) => ({
      width: '0px',
      height: '8px',
      borderRight: `1px solid ${theme.palette.primary.main}`,
      ...sx,
    })}
  />
)
const Dash = () => (
  <Box
    sx={(theme) => ({
      flexGrow: 1,
      height: '0px',
      borderBottom: `1px solid ${theme.palette.primary.main}`,
    })}
  />
)

// TODO [3]: when work region is smaller than Project total, draw left/right arrow instead of vertical tick mark

const RegionSelection = observer(({
  frameIn,
  frameOut,
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
  const [editOut, setEditOut] = useState(false)
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
        pr: 1,
        mb: 1,
        mr: -1,
        zIndex: 900,
        backgroundColor: 'background.paper',
        boxShadow: theme.shadows[2],
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
              setPropertyValue={(newValue) => setIn(newValue)}
              onBlur={() => setEditIn(false)}
              noLabel
              autoFocus
            />
          ) : (
            <Typography
              className="noselect"
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
                setPropertyValue={(newValue) => setOut(newValue)}
                onBlur={() => setEditOut(false)}
                noLabel
                autoFocus
              />
            ) : (
              <Typography
                className="noselect"
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
              >
                {frameOut}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Tick />
          <Dash />
          <Tick />
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

      <Box
        sx={{
          position: 'absolute',
          height: '100%',
          width: '16px',
          zIndex: 901,
          top: 0,
          right: '-12px',
          backgroundColor: 'background.paper',
        }}
      />
    </Box>
  )
})

export default RegionSelection
