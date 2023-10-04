import { useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

import { LABEL_WIDTH, KEYFRAME_DIAMETER } from './config'

const cssRotationOffset = (KEYFRAME_DIAMETER / 2)

const LineOfKeyframes = observer(({ label, keyframes, frameIn, frameOut, isHovered, setHovered }) => {
  const lineItemRef = useRef()

  const numFramesShown = frameOut - frameIn + 1

  const pixelsPerFrame = lineItemRef.current ? (
    (lineItemRef.current.clientWidth) / (numFramesShown - 1)
  ) : 0

  const [newKeyPosition, setNewKeyPosition] = useState(null)
  const handlePointerBetweenKeys = (event) => {
    const mouseLeftRelativeToHoverRegion = event.nativeEvent.offsetX
    setNewKeyPosition(mouseLeftRelativeToHoverRegion)
    setHovered(label)
  }
  const clearNewKey = () => setNewKeyPosition(null)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: `${LABEL_WIDTH}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Typography
          className="noselect"
          component="label"
          sx={{
            display: 'inline-block',
            width: '100%',
            textAlign: 'right',
            mr: 2,
            fontFamily: 'monospace',
            fontSize: 12,
            color: 'text.disabled',
            cursor: 'pointer',
            '&:hover': { color: 'text.secondary' },
          }}
        >
          {label}
        </Typography>
      </Box>

      <Box ref={lineItemRef} sx={{ display: 'flex', alignItems: 'center', position: 'relative', flexGrow: 1 }}>
        {/* Keyframe "Line" */}
        <Box
          sx={{
            position: 'absolute',
            left: '0px',
            right: '0px',
            height: '1px',
            backgroundColor: 'action.hover',
          }}
        />

        {/* Dimmed Keyframe-to-Add Dot */}
        {(newKeyPosition && isHovered) && (
          <Box
            sx={(theme) => ({
              width: `${KEYFRAME_DIAMETER}px`,
              height: `${KEYFRAME_DIAMETER}px`,
              backgroundColor: 'action.disabled',
              borderRadius: '2px',
              transform: 'rotate(45deg)',
              position: 'absolute',
              left: `calc(${newKeyPosition - cssRotationOffset}px - ${theme.spacing(1)} - 3px)`,
            })}
          />
        )}

        {/* Mouse Hover Listenter */}
        <Box
          onPointerMove={handlePointerBetweenKeys}
          sx={(theme) => ({
            position: 'absolute',
            left: `-${theme.spacing(1)}`,
            right: `-${theme.spacing(1)}`,
            top: '-3px', // this is for better UX "feeling"
            height: `${theme.spacing(2)}`,
            // backgroundColor: 'rgba(255, 0, 0, 0.3)',
          })}
        />

        {/* Existing Keyframe Dots */}
        {keyframes
          .filter((keyframe) => (
            keyframe.frame >= frameIn && keyframe.frame <= frameOut
          ))
          .map((keyframe) => {
            let keyPositionX = ((keyframe.frame - frameIn) * pixelsPerFrame).toFixed(2)
            keyPositionX -= cssRotationOffset
            const valueShort = `${keyframe.value}`.split('(').pop().replace(')', '')
            return (
              <Tooltip
                key={`${keyframe.frame}`}
                title={`f${keyframe.frame}: ${valueShort}`}
                onPointerMove={clearNewKey}
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      fontFamily: 'monospace',
                    },
                    onPointerMove: clearNewKey,
                  },
                }}
              >
                <Box
                  onPointerMove={clearNewKey}
                  sx={() => ({
                    width: `${KEYFRAME_DIAMETER}px`,
                    height: `${KEYFRAME_DIAMETER}px`,
                    backgroundColor: 'primary.main',
                    borderRadius: '2px',
                    transform: 'rotate(45deg)',
                    position: 'absolute',
                    left: `${keyPositionX}px`,
                    cursor: 'pointer',
                    '&:hover': {
                      borderRadius: '1px',
                      outline: '1px solid rgba(255, 255, 255, 0.9)',
                    },
                  })}
                />
              </Tooltip>
            )
          })
        }
      </Box>
    </Box>
  )
})

export default LineOfKeyframes
