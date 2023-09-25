/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useRef, useState } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import ButtonBase from '@mui/material/ButtonBase'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import './BottomMenu.css'
import theme from './theme'
import Animation from '../lib/animation/Animation'
import { identityMatrix } from '../utility/matrix'
import { drawPlayheadHoverLine, drawPlayhead } from '../utility/drawing'
import { doesBottomMenuHaveFocus } from './KeyHandler'

const FRAME_TICK_MIN_WIDTH = 10

const BottomMenu = observer(({ store, windowWidth }) => {
  // Show/Hide keyframe editing panel
  const [bottomOpen, setBottomOpen] = useState(false)

  const playheadRef = useRef()
  const playheadCanvasWidth = windowWidth - store.playhead.canvasWidthLessThanWindow
  const playheadCSSTrueHalf = store.playhead.cssTrueHalf

  const playPauseText = store.animation.playing ? '❙ ❙' : '▶'
  const playModeText = store.animation.mode

  useEffect(() => {
    if (store.playhead.hovered) {
      playheadRef.current.style.cursor = 'ew-resize'
    } else {
      playheadRef.current.style.cursor = 'inherit'
    }
  }, [store.playhead.hovered])

  const drawPlayheadMemo = useCallback((ctx) => (
    drawPlayhead(
      ctx,
      store.DPR,
      store.playhead.cssWidth,
      store.playhead.hovered,
      store.playhead.cssStrokeProtrusion,
    )
  ), [store.playhead.hovered]) // eslint-disable-line

  useEffect(() => {
    const playheadCSSTrueFullWidth = playheadCSSTrueHalf * 2
    const pixelsPerFrame = (playheadCanvasWidth - playheadCSSTrueFullWidth) / (store.animation.frames - 1)
    store.setPlayheadPixelsPerFrame(pixelsPerFrame)
  }, [
    playheadCanvasWidth,
    playheadCSSTrueHalf,
    store,
    store.animation.frames,
  ])

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
    const regionLeftStart = playheadCSSTrueHalf * store.DPR
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

    const drawLineAt = (store.playhead.hoverLineFrame - 1) * pixelsPerFrame + (playheadCSSTrueHalf * ummDoubleIt)
    ctx.translate(drawLineAt, 0)
    if (store.playhead.hoverLineFrame > 0 && store.playhead.hoverLineFrame <= store.animation.frames) {
      drawPlayheadHoverLine(ctx, store.DPR)
    }

    ctx.setTransform(preDrawTransform)
    ctx.translate((store.animation.now - 1) * pixelsPerFrame, 0)
    drawPlayheadMemo(ctx)
  }, [
    playheadCSSTrueHalf,
    drawPlayheadMemo,
    store,
    store.DPR,
    store.animation.now,
    store.animation.frames,
    store.animation.firstFrame,
    store.animation.lastFrame,
    store.playhead.pixelsPerFrame,
    store.playhead.hoverLineFrame,
  ])

  const handlePlayPauseClick = action(() => {
    if (store.animation.playing) {
      store.animation.pause()
    } else {
      store.animation.play()
    }
  })

  const handlePlayModeClick = action(() => {
    if (store.animation.mode === Animation.PLAYBACK_MODES[0]) {
      store.animation.mode = Animation.PLAYBACK_MODES[1]
    } else if (store.animation.mode === Animation.PLAYBACK_MODES[1]) {
      store.animation.mode = Animation.PLAYBACK_MODES[0]
    }
  })

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

  // Focus Listener / Syncer
  const [hasFocus, setHasFocus] = useState(false)
  const onFocusChange = useCallback(() => {
    if (doesBottomMenuHaveFocus()) {
      setHasFocus(true)
    } else {
      setHasFocus(false)
    }
  }, [])
  useEffect(() => {
    window.addEventListener('focusin', onFocusChange, true)
    return () => {
      window.removeEventListener('focusin', onFocusChange, true)
    }
  }, [onFocusChange])

  return (
    <div id="bottom-menu" tabIndex="0">
      <ButtonBase
        id="bottom-menu-tab"
        onClick={() => setBottomOpen(!bottomOpen)}
        focusRipple
      >
        <KeyboardArrowUpIcon
          sx={(muiTheme) => ({
            transition: `transform ${muiTheme.transitions.duration.shorter}ms`,
            transform: bottomOpen && 'rotate(180deg)',
          })}
        />
      </ButtonBase>

      <div id="play-controls">
        <button
          type="button"
          id="jump-start-button"
          className="jump-button noselect"
          onClick={action(() => { store.animation.goToFirst() })}
        >
          ⇤
        </button>
        <button
          type="button"
          id="play-pause-button"
          className="jump-button font-12 noselect"
          onClick={handlePlayPauseClick}
        >
          {playPauseText}
        </button>
        <button
          type="button"
          id="jump-end-button"
          className="jump-button noselect"
          onClick={action(() => { store.animation.goToLast() })}
        >
          ⇥
        </button>
      </div>

      <div id="timeline-container">
        <div
          id="timeline-tick-container"
          style={{
            marginLeft: playheadCSSTrueHalf - 0.5,
            marginRight: playheadCSSTrueHalf,
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

      <span id="frame-ticker" className="noselect">{store.animation.now}</span>

      <button
        type="button"
        id="play-mode-button"
        className="jump-button noselect"
        onClick={handlePlayModeClick}
      >
        {playModeText}
      </button>

      {hasFocus && (
        <>
          <div id="bottom-menu-outliner-1" />
          <div id="bottom-menu-outliner-2" />
          <div id="bottom-menu-outliner-3" />
        </>
      )}
    </div>
  )
})

export default BottomMenu
