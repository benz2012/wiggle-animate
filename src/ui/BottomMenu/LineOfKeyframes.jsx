import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

import { LABEL_WIDTH, KEYFRAME_DIAMETER, CSS_ROTATION_OFFSET } from './config'
import theme from '../theme'
import Keyframe from '../../lib/animation/Keyframe'
import Angle from '../../lib/structure/Angle'
import Color from '../../lib/visuals/Color'

const LineOfKeyframes = observer(({
  label,
  keyframes,
  selectedKeyframeIds,
  frameIn,
  frameOut,
  pixelsPerFrame,
  drawNewKeyAt,
  drawCurveTargetLineWith,
  addKeyframe,
  onKeyframePress,
  onKeyframeDoubleClick,
  onLabelClick,
}) => {
  const visibleKeyframes = keyframes.filter((keyframe) => (
    keyframe.frame >= frameIn && keyframe.frame <= frameOut
  )).sort(Keyframe.sort)

  let curveTargetLineLeft
  let curveTargetLineRight
  if (drawCurveTargetLineWith?.length > 0) {
    const [firstKeyframe, secondKeyframe] = drawCurveTargetLineWith
    curveTargetLineLeft = ((firstKeyframe.frame - frameIn) * pixelsPerFrame).toFixed(2)
    curveTargetLineRight = ((secondKeyframe.frame - frameIn) * pixelsPerFrame).toFixed(2)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: `${LABEL_WIDTH}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Typography
          className="noselect"
          component="label"
          onClick={(event) => {
            const visibleKeyframeIds = visibleKeyframes.map((k) => k.id)
            onLabelClick(visibleKeyframeIds, !event.shiftKey)
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
          sx={(muiTheme) => ({
            position: 'absolute',
            left: '0px',
            right: muiTheme.spacing(1),
            height: '1px',
            backgroundColor: 'action.hover',
          })}
        />

        {/* Selected Keyframe Curve Range */}
        {(drawCurveTargetLineWith != null) && (
          <Box
            sx={{
              position: 'absolute',
              left: `${curveTargetLineLeft}px`,
              width: `${curveTargetLineRight - curveTargetLineLeft}px`,
              height: '2px',
              backgroundColor: `${theme.palette.tertiary[100]}`,
            }}
          />
        )}

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
            right: 0,
            top: '-4px', // this is for better UX "feeling"
            height: '18px',
            // backgroundColor: 'rgba(255, 0, 0, 0.3)',
          })}
        />

        {/* Existing Keyframe Dots */}
        {visibleKeyframes.map((keyframe) => {
          let keyPositionX = ((keyframe.frame - frameIn) * pixelsPerFrame).toFixed(2)
          keyPositionX -= CSS_ROTATION_OFFSET

          let valueShort
          if (
            keyframe.value instanceof Angle
            || keyframe.value instanceof Color
          ) {
            valueShort = keyframe.value.toShortString()
          } else {
            valueShort = `${keyframe.value}`
            if (valueShort.includes('(')) {
              valueShort = valueShort.split('(').pop().replace(')', '')
            }
            if (label.includes('opacity')) {
              valueShort = `${valueShort}%`
            }
          }

          const selectedIndicator = !selectedKeyframeIds.includes(keyframe.id) ? ({}) : ({
            backgroundColor: `${theme.palette.tertiary[100]}`,
            outline: '1px solid white',
          })

          return (
            <Tooltip
              key={`${keyframe.id}`}
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
                id={`keyframe-item--${label}--${keyframe.id}`}
                className="noselect"
                onPointerDown={(event) => {
                  onKeyframePress(keyframe.id, !event.shiftKey)
                }}
                onDoubleClick={(event) => {
                  if (event.detail !== 2) return
                  onKeyframeDoubleClick(keyframe.id)
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
