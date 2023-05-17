/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useRef } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'

import './BottomMenu.css'
import Animation from '../lib/animation/Animation'
import { identityMatrix } from '../utility/matrix'
import { drawPlayhead } from '../utility/drawing'

const BottomMenu = observer(({ store, windowWidth }) => {
  const playheadRef = useRef()
  // TODO: move all these units to the store for easier access & reuse
  // defined at DPR 1 aka CSS units
  const playheadCanvasWidth = windowWidth - 184
  const playheadCanvasHeight = 40
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
    drawPlayhead(ctx, store.DPR, playheadWidth, store.view.playheadHovered)
  ), [
    store.DPR,
    store.view.playheadHovered,
  ])

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
    ctx.scale(store.DPR / 2, store.DPR / 2)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.translate(0, canvasHeight / 2 + 1)

    const pixelsPerFrame = store.view.playheadPixelsPerFrame * store.DPR

    // draw the playback in/out regions
    ctx.fillStyle = 'rgba(25, 117, 210, 0.3)'
    if (store.animation.firstFrame !== Animation.FIRST) {
      ctx.fillRect(
        playheadCSSTrueHalf * store.DPR,
        playheadCanvasHeight / 6,
        pixelsPerFrame * (store.animation.firstFrame - 1),
        playbackRegionHeight,
      )
    }
    if (store.animation.lastFrame !== store.animation.frames) {
      ctx.fillRect(
        pixelsPerFrame * store.animation.lastFrame,
        playheadCanvasHeight / 6,
        pixelsPerFrame * (store.animation.frames - store.animation.lastFrame) - (playheadTotalStroke / store.DPR),
        playbackRegionHeight,
      )
    }

    ctx.translate(pixelsPerFrame * (store.animation.now - 1), 0)
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
  ])

  const handlePlayPauseClick = action(() => {
    if (store.animation.playing) {
      store.animation.pause()
    } else {
      store.animation.play()
    }
  })

  const handlePlayModeClick = action(() => {
    /* eslint-disable prefer-destructuring */
    if (store.animation.mode === Animation.PLAYBACK_MODES[0]) {
      store.animation.mode = Animation.PLAYBACK_MODES[1]
    } else if (store.animation.mode === Animation.PLAYBACK_MODES[1]) {
      store.animation.mode = Animation.PLAYBACK_MODES[0]
    }
  })

  return (
    <div id="bottom-menu" tabIndex="0">
      <button type="button" id="bottom-menu-tab" className="noselect">▲</button>
      <div id="play-controls">
        <button
          type="button"
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
          className="jump-button noselect"
          onClick={action(() => { store.animation.goToLast() })}
        >
          ⇥
        </button>
      </div>

      <div id="timeline-container">
        <div
          id="timeline-horizontal-line"
          style={{
            marginLeft: playheadCSSTrueHalf,
            marginRight: playheadCSSTrueHalf,
          }}
        />
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
    </div>
  )
})

export default BottomMenu
