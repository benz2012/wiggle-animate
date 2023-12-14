import { useCallback, useEffect, useRef, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'

import theme from '../theme'
import { identityMatrix } from '../../utility/matrix'
import { drawGrid, drawBezier, drawControlHandle } from '../../utility/drawing/curveEditor'
import Keyframe from '../../lib/animation/Keyframe'
import CenteredMessageCurveEditor from './CenteredMessageCurveEditor'

// TODO [3]: Hold Shift to snap-to-grid while moving the handle

const CurveEditorCanvas = observer(({ store, width }) => {
  const curveEditorCanvasRef = useRef()

  // Render Determinations
  const [showCanvas, targetKeyframes] = useMemo(() => {
    const selectedKeyframeFullIds = store.keyframeEditor.selectedIds
    const numSelected = selectedKeyframeFullIds.length

    if ([1, 2].includes(numSelected) === false) {
      // We can only find a pair of keyframes when 1 or 2 is selected
      return [false, []]
    }

    const selectedItem = store.rootContainer.findItem(store.build.selectedIds[0])

    if (numSelected === 1) {
      const fullId = selectedKeyframeFullIds[0]
      const [_, selectedPropName, selectedKeyframeId] = fullId.split('--')
      if (selectedItem[selectedPropName].keyframes.length === 1) {
        // One is selected but the are no others to create a pair
        return [false, []]
      }

      const sortedKeyframes = [...selectedItem[selectedPropName].keyframes].sort(Keyframe.sort)
      const selectedKeyframeIdx = sortedKeyframes.findIndex((keyframe) => keyframe.id === selectedKeyframeId)
      const nextKeyframeIdx = selectedKeyframeIdx + 1
      if ((sortedKeyframes.length - 1) < (selectedKeyframeIdx + 1)) {
        // The one that is selected is the last one, no pair exists
        return [false, []]
      }

      return [true, [sortedKeyframes[selectedKeyframeIdx], sortedKeyframes[nextKeyframeIdx]]]
    }

    const seenItemIds = {}
    const seenPropNames = {}
    const seenKeyframeIds = []

    const areSelectedKeyframesFromSameItemAndProp = selectedKeyframeFullIds
      .every((fullId) => {
        const [selectedItemId, selectedPropName, selectedKeyframeId] = fullId.split('--')
        if (!(selectedItemId in seenItemIds) && Object.keys(seenItemIds).length > 0) {
          return false
        }
        seenItemIds[selectedItemId] = true
        if (!(selectedPropName in seenPropNames) && Object.keys(seenPropNames).length > 0) {
          return false
        }
        seenPropNames[selectedPropName] = true
        seenKeyframeIds.push(selectedKeyframeId)
        return true
      })

    if (!areSelectedKeyframesFromSameItemAndProp) {
      return [false, []]
    }

    const selectedPropName = Object.keys(seenPropNames)[0]
    const sortedKeyframes = [...selectedItem[selectedPropName].keyframes].sort(Keyframe.sort)
    const keyIdx1 = sortedKeyframes.findIndex((keyframe) => keyframe.id === seenKeyframeIds[0])
    const keyIdx2 = sortedKeyframes.findIndex((keyframe) => keyframe.id === seenKeyframeIds[1])
    if (Math.abs(keyIdx2 - keyIdx1) !== 1) {
      // The two that are selected are not in-sequence
      return [false, []]
    }

    const _targetKeyframes = [sortedKeyframes[keyIdx1], sortedKeyframes[keyIdx2]].sort(Keyframe.sort)
    return [true, _targetKeyframes]
  }, [
    store.keyframeEditor.selectedIds,
    store.build.selectedIds,
    store.rootContainer,
  ])

  // Visual Helpers
  const units = useCallback((unit) => unit * store.DPR, [store.DPR])
  const canvasSourceWidth = Math.round(width * 0.9)
  const canvasSourceHeight = Math.round(width * 0.9)
  const labelBoxHeight = width - canvasSourceHeight

  // Drawing Loop
  const targetKeyframesStr = JSON.stringify(targetKeyframes)
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    if (!curveEditorCanvasRef.current) return

    const canvas = curveEditorCanvasRef.current
    const ctx = canvas.getContext('2d')
    const { width: canvasWidth, height: canvasHeight } = canvas

    const padding = units(theme.spacing[1])
    const innerSize = canvasWidth - padding * 2

    const { x: c1x, y: c1y } = targetKeyframes[0].handleOut.position
    const { x: c2x, y: c2y } = targetKeyframes[1].handleOut.position

    ctx.setTransform(identityMatrix())
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.translate(padding, padding)

    drawGrid(ctx, units, padding, innerSize)
    drawBezier(ctx, units, innerSize, c1x, c1y, c2x, c2y)

    drawControlHandle(ctx, units, innerSize, 1, c1x, c1y)
    drawControlHandle(ctx, units, innerSize, 2, c2x, c2y)
  }, [
    showCanvas,
    units,
    targetKeyframesStr,
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
      <Box sx={{ height: labelBoxHeight }}>
        {showCanvas && (
          'some label text here'
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
