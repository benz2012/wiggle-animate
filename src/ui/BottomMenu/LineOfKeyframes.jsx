import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

import { LABEL_WIDTH, KEYFRAME_DIAMETER } from './config'
import Keyframe from '../../lib/animation/Keyframe'
import theme from '../theme'

const cssRotationOffset = (KEYFRAME_DIAMETER / 2)

const LineOfKeyframes = observer(({
  label,
  keyframes,
  selectedFrames,
  frameIn,
  frameOut,
  pixelsPerFrame,
  drawNewKeyAt,
  addKeyframe,
  onKeyframeClick,
  onKeyframeDoubleClick,
  onLabelClick,
}) => {
  const visibleKeyframes = keyframes.filter((keyframe) => (
    keyframe.frame >= frameIn && keyframe.frame <= frameOut
  )).sort(Keyframe.sort)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: `${LABEL_WIDTH}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Typography
          className="noselect"
          component="label"
          onClick={(event) => {
            const visibleKeyframeFrames = visibleKeyframes.map((k) => k.frame)
            onLabelClick(visibleKeyframeFrames, !event.shiftKey)
          }}
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

      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', flexGrow: 1 }}>
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
        {(drawNewKeyAt != null) && (
          <Box
            sx={{
              width: `${KEYFRAME_DIAMETER}px`,
              height: `${KEYFRAME_DIAMETER}px`,
              backgroundColor: 'action.disabled',
              borderRadius: '2px',
              transform: 'rotate(45deg)',
              position: 'absolute',
              left: `${drawNewKeyAt}px`,
            }}
          />
        )}

        {/* Mouse Hover Listenter */}
        <Box
          id={`keyframe-line--${label}`}
          onClick={addKeyframe}
          sx={(muiTheme) => ({
            position: 'absolute',
            left: `-${muiTheme.spacing(1)}`,
            right: `-${muiTheme.spacing(1)}`,
            top: '-4px', // this is for better UX "feeling"
            height: '18px',
            // backgroundColor: 'rgba(255, 0, 0, 0.3)',
          })}
        />

        {/* Existing Keyframe Dots */}
        {visibleKeyframes.map((keyframe) => {
          let keyPositionX = ((keyframe.frame - frameIn) * pixelsPerFrame).toFixed(2)
          keyPositionX -= cssRotationOffset
          const valueShort = `${keyframe.value}`.split('(').pop().replace(')', '')

          const selectedIndicator = !selectedFrames.includes(keyframe.frame) ? ({}) : ({
            backgroundColor: `${theme.palette.tertiary[100]}`,
            outline: '1px solid white',
          })

          return (
            <Tooltip
              key={`${keyframe.frame}`}
              title={`${valueShort}`}
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    fontFamily: 'monospace',
                  },
                },
              }}
            >
              <Box
                onClick={(event) => {
                  if (event.detail !== 1) return
                  onKeyframeClick(keyframe.frame, !event.shiftKey)
                }}
                onDoubleClick={(event) => {
                  if (event.detail !== 2) return
                  onKeyframeDoubleClick(keyframe.frame)
                }}
                sx={{
                  cursor: 'pointer',

                  width: `${KEYFRAME_DIAMETER}px`,
                  height: `${KEYFRAME_DIAMETER}px`,
                  position: 'absolute',
                  left: `${keyPositionX}px`,
                  transform: 'rotate(45deg)',

                  backgroundColor: 'primary.main',
                  borderRadius: '2px',
                  outline: '1px solid rgb(13, 71, 161)',
                  ...selectedIndicator,

                  '&:hover': {
                    outline: '1px solid rgba(255, 255, 255, 0.9)',
                    ...selectedIndicator,
                  },
                }}
              />
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
})

export default LineOfKeyframes
