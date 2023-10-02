import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LABEL_WIDTH, KEYFRAME_DIAMETER } from './config'

const LineOfKeyframes = observer(({ label, keyframes, totalFrames }) => {
  const lineItemRef = useRef()

  const pixelsPerFrame = lineItemRef.current ? (
    (lineItemRef.current.clientWidth) / (totalFrames - 1)
  ) : 0

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
        <Box
          sx={{
            position: 'absolute',
            left: '0px',
            right: '0px',
            height: '1px',
            backgroundColor: 'action.hover',
          }}
        />

        {keyframes.map((keyframe) => {
          let keyPositionX = ((keyframe.frame - 1) * pixelsPerFrame).toFixed(2)
          const cssRotationOffset = (KEYFRAME_DIAMETER / 2)
          keyPositionX -= cssRotationOffset
          return (
            <Box
              key={`${keyframe.frame}`}
              sx={{
                width: `${KEYFRAME_DIAMETER}px`,
                height: `${KEYFRAME_DIAMETER}px`,
                backgroundColor: 'primary.main',
                outline: '1px solid white',
                borderRadius: '1px',
                transform: 'rotate(45deg)',
                position: 'absolute',
                left: `${keyPositionX}px`,
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
})

export default LineOfKeyframes
