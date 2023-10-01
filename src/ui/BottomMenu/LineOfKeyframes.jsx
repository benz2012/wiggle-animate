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
      <Typography
        className="noselect"
        component="label"
        sx={{
          width: `${LABEL_WIDTH}px`,
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'text.disabled',
          cursor: 'pointer',
          '&:hover': { color: 'text.secondary' },
        }}
      >
        {label}
      </Typography>

      <Box ref={lineItemRef} sx={{ position: 'relative', flexGrow: 1 }}>
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
