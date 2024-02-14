import { useCallback, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'

import theme from '../theme'
import { identityMatrix } from '../../utility/matrix'
import { drawGrid, drawBezier, drawControlHandle } from '../../utility/drawing/curveEditor'
import CenteredMessageCurveEditor from './CenteredMessageCurveEditor'
import LabelText from './LabelText'

// TODO [4]: Add a "set to" dropdown with options like linear, ease-in-out, ease-in, ease-out
// TODO [4]: Allow "set to" to be used/applied when multiple keyframes are selected

const CurveEditorCanvas = observer(({ store, width }) => {
  const curveEditorCanvasRef = useRef()

  const [showCanvas, targetKeyframes, keyframeLabel] = store.curveEditor.targetKeyframeInfo

  // Visual Helpers
  const units = useCallback((unit) => unit * store.DPR, [store.DPR])
  const padding = units(theme.spacing[1])
  const canvasSourceWidth = Math.round(width * 0.9)
  const canvasSourceHeight = Math.round(width * 0.9)
  const labelBoxHeight = width - canvasSourceHeight

  useEffect(() => {
    if (!curveEditorCanvasRef.current) return
    const canvas = curveEditorCanvasRef.current
    store.curveEditor.setInnerWidth(canvas.width - (padding * 2))
  }, [
    store,
    showCanvas,
    width,
    padding,
  ])

  // Mouse Interactions
  const { handle1Intersection, handle2Intersection } = store.curveEditor
  useEffect(() => {
    if (!curveEditorCanvasRef.current) return
    if (handle1Intersection || handle2Intersection) {
      curveEditorCanvasRef.current.style.cursor = 'pointer'
    } else {
      curveEditorCanvasRef.current.style.cursor = 'default'
    }
  }, [
    handle1Intersection,
    handle2Intersection,
  ])

  // Drawing Loop
  const targetKeyframesStr = JSON.stringify(targetKeyframes)
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    if (!showCanvas) return
    if (!curveEditorCanvasRef.current) return

    const canvas = curveEditorCanvasRef.current
    const ctx = canvas.getContext('2d')
    const { width: canvasWidth, height: canvasHeight } = canvas

    const innerSize = canvasWidth - padding * 2

    // Each point is defined as from-anchor, so we need to convert
    // into Quadrant-4 space (aka web browser 0,0 = top-left)
    const controlHandle1 = targetKeyframes[0].handleOut
    const c1x = controlHandle1.influence
    const c1y = 1 - controlHandle1.distance
    const controlHandle2 = targetKeyframes[1].handleIn
    const c2x = 1 - controlHandle2.influence
    const c2y = controlHandle2.distance

    ctx.setTransform(identityMatrix())
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.translate(padding, padding)

    drawGrid(ctx, units, padding, innerSize)
    drawBezier(ctx, units, innerSize, c1x, c1y, c2x, c2y)

    const { x: pointerX, y: pointerY } = store.build.pointerPosition.object
    const { x: canvasX, y: canvasY } = canvas.getBoundingClientRect()
    const pointerRelative = {
      x: pointerX - units(canvasX),
      y: pointerY - units(canvasY),
    }

    drawControlHandle(...[
      ctx, units, innerSize,
      1, c1x, c1y,
      store.curveEditor.setHandleIntersection,
      pointerRelative,
      store.curveEditor.dragStartWhichHandle === 1,
    ])
    drawControlHandle(...[
      ctx, units, innerSize,
      2, c2x, c2y,
      store.curveEditor.setHandleIntersection,
      pointerRelative,
      store.curveEditor.dragStartWhichHandle === 2,
    ])
  }, [
    showCanvas,
    units,
    padding,
    targetKeyframesStr,
    store.build.pointerPosition,
    store.curveEditor.dragStartWhichHandle,
  ])

  return (
    <Box
      sx={{
        width: `${width}px`,
        height: `${width}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Label text */}
      <Box
        sx={{
          height: labelBoxHeight,
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ml: 2,
          gap: 1,
        }}
      >
        {showCanvas && (
          <>
            <LabelText>{keyframeLabel}</LabelText>
            <LabelText>f{targetKeyframes[0].frame} - f{targetKeyframes[1].frame}</LabelText>
          </>
        )}
      </Box>

      {showCanvas ? (
        <canvas
          ref={curveEditorCanvasRef}
          id="curve-editor-canvas"
          width={canvasSourceWidth * store.DPR}
          height={canvasSourceHeight * store.DPR}
          style={{ width: canvasSourceWidth, height: canvasSourceHeight }}
        />
      ) : (
        <CenteredMessageCurveEditor />
      )}
    </Box>
  )
})

export default CurveEditorCanvas
