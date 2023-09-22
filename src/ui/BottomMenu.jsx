/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useRef, useState } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'

import './BottomMenu.css'
import theme from './theme'
import Animation from '../lib/animation/Animation'
import { identityMatrix } from '../utility/matrix'
import { drawPlayheadHoverLine, drawPlayhead } from '../utility/drawing'
import { doesBottomMenuHaveFocus } from './KeyHandler'

const FRAME_TICK_MIN_WIDTH = 10

const BottomMenu = observer(({ store, windowWidth }) => {
  const playheadRef = useRef()
  // TODO [3]: move all these units to the store for easier access & reuse
  // defined at DPR 1 aka CSS units
  const playheadCanvasWidth = windowWidth - 184
  const playheadCanvasHeight = 33
  // defined at DPR 2
  const playheadWidth = 24
  const playheadTotalStroke = 4
  // divide out the DPR-2 that was used to define the unit values above
  const playheadCSSTrueHalf = ((playheadWidth + playheadTotalStroke) / 2) / 2
  const playbackRegionHeight = 16

  const playPauseText = store.animation.playing ? '❙ ❙' : '▶'

  // const playModeText = store.animation.mode === 'LOOP' ? '∞' : '⇒'
  const playModeText = store.animation.mode

  useEffect(() => {
    if (store.view.playheadHovered) {
      playheadRef.current.style.cursor = 'ew-resize'
    } else {
      playheadRef.current.style.cursor = 'inherit'
    }
  }, [store.view.playheadHovered])

  const drawPlayheadMemo = useCallback((ctx) => (
    drawPlayhead(ctx, playheadWidth, store.view.playheadHovered)
  ), [store.view.playheadHovered])

  useEffect(() => {
    // playheadWidth is defined in DPR ratio units, whereas playheadCanvasWidth is in CSS units
    const pixelsPerFrame = (playheadCanvasWidth - playheadCSSTrueHalf * 2) / (store.animation.frames - 1)
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
    const pixelsPerFrame = store.view.playheadPixelsPerFrame * ummDoubleIt

    // draw the playback in/out regions
    ctx.fillStyle = theme.palette.primary_dark[30].toString()
    const regionLeftStart = playheadCSSTrueHalf * store.DPR
    const regionTopStart = 6
    if (store.animation.firstFrame !== Animation.FIRST) {
      ctx.fillRect(
        regionLeftStart,
        regionTopStart,
        pixelsPerFrame * (store.animation.firstFrame - 1),
        playbackRegionHeight,
      )
    }
    if (store.animation.lastFrame !== store.animation.frames) {
      ctx.fillRect(
        regionLeftStart + (pixelsPerFrame * (store.animation.lastFrame - 1)),
        regionTopStart,
        pixelsPerFrame * (store.animation.frames - store.animation.lastFrame),
        playbackRegionHeight,
      )
    }

    const thinLineOffset = store.DPR === 1 ? 0.5 : 0
    ctx.translate(thinLineOffset, 0)
    const preDrawTransform = ctx.getTransform()

    const drawLineAt = (store.view.playheadHoverLineFrame - 1) * pixelsPerFrame + (playheadCSSTrueHalf * ummDoubleIt)
    ctx.translate(drawLineAt, 0)
    if (store.view.playheadHoverLineFrame > 0 && store.view.playheadHoverLineFrame <= store.animation.frames) {
      drawPlayheadHoverLine(ctx)
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
    store.view.playheadPixelsPerFrame,
    store.view.playheadHoverLineFrame,
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
  if (store.view.playheadPixelsPerFrame > 0) {
    let tickIntervalToDisplay = 1

    if (store.view.playheadPixelsPerFrame < FRAME_TICK_MIN_WIDTH) {
      tickIntervalToDisplay = Math.ceil(FRAME_TICK_MIN_WIDTH / store.view.playheadPixelsPerFrame)
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
      <button type="button" id="bottom-menu-tab" className="noselect">▲</button>
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
              style={{ width: framesLeftWithNoTick * store.view.playheadPixelsPerFrame }}
            />
          )}
        </div>
        <canvas
          ref={playheadRef}
          id="playhead-canvas"
          width={playheadCanvasWidth * store.DPR}
          height={playheadCanvasHeight * store.DPR}
          style={{ width: playheadCanvasWidth, height: playheadCanvasHeight }}
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
