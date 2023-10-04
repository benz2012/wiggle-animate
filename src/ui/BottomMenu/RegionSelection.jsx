/* eslint-disable react/no-array-index-key */
import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LABEL_WIDTH } from './config'
import { isOdd } from '../../utility/numbers'
import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'

const mono12 = { fontFamily: 'monospace', fontSize: 12 }
const interNumLefts = ['calc(33.33% - 6px)', 'calc(66.66% - 6px)', 'calc(50% - 6px)']

const Tick = () => (
  <Box
    sx={(theme) => ({
      width: '0px',
      height: '8px',
      borderRight: `1px solid ${theme.palette.primary.main}`,
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

const RegionSelection = observer(({ frameIn, frameOut, setIn, setOut }) => {
  const numFramesShown = frameOut - frameIn + 1
  let interTickNums = []

  if (numFramesShown >= 3) {
    if (isOdd(numFramesShown)) {
      // when number of frames is odd, we can show the true middle tick
      const interFrame = (numFramesShown - 1) / 2
      interTickNums = [frameIn + interFrame]
    } else {
      // otherwise, show two ticks that are vaugly at the third marks
      const interFrame = (numFramesShown - 1) / 3
      interTickNums = [Math.round(frameIn + interFrame), Math.round(frameIn + interFrame * 2)]
    }
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
    <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '30px', position: 'relative' }}>
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
              sx={{
                ...mono12,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => setEditIn(true)}
            >
              {frameIn}
            </Typography>
          )}

          {interTickNums.map((frameNum, index) => (
            <Typography
              key={frameNum}
              className="noselect"
              sx={{
                ...mono12,
                position: 'absolute',
                left: interTickNums.length === 2 ? interNumLefts[index] : interNumLefts[2],
              }}
            >
              {frameNum}
            </Typography>
          ))}

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
                sx={{
                  ...mono12,
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={() => setEditOut(true)}
              >
                {frameOut}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tick />
          {interTickNums.map((_, index) => [
            <Dash key={`dash-${index}`} />,
            <Tick key={`tick-${index}`} />,
          ])}
          <Dash />
          <Tick />
        </Box>
      </Box>
    </Box>
  )
})

export default RegionSelection
