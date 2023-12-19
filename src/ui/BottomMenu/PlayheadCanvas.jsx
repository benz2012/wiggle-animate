import { useCallback, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'

import theme from '../theme'
import { identityMatrix } from '../../utility/matrix'
import { drawPlayheadHoverLine, drawPlayhead } from '../../utility/drawing'

const FRAME_TICK_MIN_WIDTH = 10

const PlayheadCanvas = observer(({ store, windowWidth }) => {
  const { cssTrueHalf, canvasWidthLessThanWindow } = store.playhead
  const playheadRef = useRef()

  const playheadCanvasWidth = windowWidth - canvasWidthLessThanWindow

  const keyframeFrameHovered = store.keyframeHoverInformation[1]

  // Set Cursor over Playhead
  useEffect(() => {
    if (store.playhead.hovered) {
      playheadRef.current.style.cursor = 'ew-resize'
    } else {
      playheadRef.current.style.cursor = 'inherit'
    }
  }, [store.playhead.hovered])

  // Set incremental pixel width based on many factors
  useEffect(() => {
    const playheadCSSTrueFullWidth = cssTrueHalf * 2
    const pixelsPerFrame = (playheadCanvasWidth - playheadCSSTrueFullWidth) / (store.animation.frames - 1)
    store.setPlayheadPixelsPerFrame(pixelsPerFrame)
  }, [
    playheadCanvasWidth,
    cssTrueHalf,
    store,
    store.animation.frames,
  ])

  const drawPlayheadMemo = useCallback((ctx) => (
    drawPlayhead(
      ctx,
      store.DPR,
      store.playhead.cssWidth,
      store.playhead.hovered,
      store.playhead.cssStrokeProtrusion,
    )
  ), [store.playhead.hovered]) // eslint-disable-line

  // Massive Draw-Loop, Draw Func
  useEffect(() => {
    const canvas = playheadRef.current
    const ctx = canvas.getContext('2d')
    const { width: canvasWidth, height: canvasHeight } = canvas

    ctx.setTransform(identityMatrix())
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.scale(store.DPR / 2, store.DPR / 2)
    ctx.translate(0, 26)

    // umm Not DPR But I Must Have Defined Something As Half, not sure what, for now
    // designed a lot of this when DPR was 2
    const ummDoubleIt = 2
    const pixelsPerFrame = store.playhead.pixelsPerFrame * ummDoubleIt

    // draw the playback in/out regions
    ctx.fillStyle = theme.palette.primary_dark[30].toString()
    const regionLeftStart = cssTrueHalf * store.DPR
    const regionTopStart = 6
    if (store.animation.firstFrame !== Animation.FIRST) {
      ctx.fillRect(
        regionLeftStart,
        regionTopStart,
        pixelsPerFrame * (store.animation.firstFrame - 1),
        store.playhead.boundRegionHeight * store.DPR,
      )
    }
    if (store.animation.lastFrame !== store.animation.frames) {
      ctx.fillRect(
        regionLeftStart + (pixelsPerFrame * (store.animation.lastFrame - 1)),
        regionTopStart,
        pixelsPerFrame * (store.animation.frames - store.animation.lastFrame),
        store.playhead.boundRegionHeight * store.DPR,
      )
    }

    const thinLineOffset = store.DPR === 1 ? 0.5 : 0
    ctx.translate(thinLineOffset, 0)
    const preDrawTransform = ctx.getTransform()

    let { hoverLineFrame } = store.playhead
    if (store.keyframeEditor.hoveredProperty) {
      hoverLineFrame = keyframeFrameHovered
    }
    const drawLineAt = (hoverLineFrame - 1) * pixelsPerFrame + (cssTrueHalf * ummDoubleIt)
    ctx.translate(drawLineAt, 0)
    if (hoverLineFrame > 0 && hoverLineFrame <= store.animation.frames) {
      drawPlayheadHoverLine(ctx, store.DPR)
    }

    ctx.setTransform(preDrawTransform)
    ctx.translate((store.animation.now - 1) * pixelsPerFrame, 0)
    drawPlayheadMemo(ctx)
  }, [
    cssTrueHalf,
    drawPlayheadMemo,
    store,
    store.DPR,
    store.animation.now,
    store.animation.frames,
    store.animation.firstFrame,
    store.animation.lastFrame,
    store.playhead.pixelsPerFrame,
    store.playhead.hoverLineFrame,
    keyframeFrameHovered,
    store.keyframeEditor.hoveredProperty,
  ])

  let numTicks = 0
  let framesLeftWithNoTick = 0
  if (store.playhead.pixelsPerFrame > 0) {
    let tickIntervalToDisplay = 1

    if (store.playhead.pixelsPerFrame < FRAME_TICK_MIN_WIDTH) {
      tickIntervalToDisplay = Math.ceil(FRAME_TICK_MIN_WIDTH / store.playhead.pixelsPerFrame)
    }

    const numTicksFloat = (store.animation.frames - 1) / tickIntervalToDisplay
    numTicks = Math.floor((store.animation.frames - 1) / tickIntervalToDisplay)
    framesLeftWithNoTick = (numTicksFloat - numTicks) * tickIntervalToDisplay
  }

  return (
    <div id="timeline-container">
      <div
        id="timeline-tick-container"
        style={{
          marginLeft: store.playhead.cssTrueHalf - 0.5,
          marginRight: store.playhead.cssTrueHalf,
        }}
      >
        {Array(numTicks).fill(true).map((_, index) => (
          /* eslint-disable react/no-array-index-key */
          <div key={index} className="timeline-tick" />
        ))}
        {Boolean(framesLeftWithNoTick) && (
          <div
            className="timeline-tick timeline-tick-leftover"
            style={{ width: framesLeftWithNoTick * store.playhead.pixelsPerFrame }}
          />
        )}
      </div>
      <canvas
        ref={playheadRef}
        id="playhead-canvas"
        width={playheadCanvasWidth * store.DPR}
        height={store.playhead.canvasHeight * store.DPR}
        style={{ width: playheadCanvasWidth, height: store.playhead.canvasHeight }}
      />
    </div>
  )
})

export default PlayheadCanvas
