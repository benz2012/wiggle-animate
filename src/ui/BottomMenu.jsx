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
  const playheadCanvasWidth = windowWidth - 177
  const playheadCanvasHeight = 40
  const playheadWidth = 24

  const playPauseText = store.animation.playing ? '❙ ❙' : '▶'

  const playModeText = store.animation.mode === 'LOOP' ? '∞' : '⇒'

  const drawPlayheadMemo = useCallback((ctx) => drawPlayhead(ctx, store.DPR, playheadWidth), [store.DPR])

  useEffect(() => {
    const canvas = playheadRef.current
    const ctx = canvas.getContext('2d')
    const { width: canvasWidth, height: canvasHeight } = canvas

    ctx.setTransform(identityMatrix())
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.translate(0, canvasHeight / 2 + 1)
    ctx.scale(store.DPR / 2, store.DPR / 2)

    const pixelsPerFrame = (canvasWidth - playheadWidth) / store.animation.frames
    ctx.translate(pixelsPerFrame * (store.animation.now - 1), 0)
    drawPlayheadMemo(ctx)
  }, [
    drawPlayheadMemo,
    playheadCanvasWidth,
    store.DPR,
    store.animation.now,
    store.animation.frames,
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
        <div id="timeline-horizontal-line" style={{ marginRight: (playheadWidth / 2) - 4 }} />
        <canvas
          ref={playheadRef}
          id="playhead-canvas"
          width={playheadCanvasWidth * store.DPR}
          height={playheadCanvasHeight * store.DPR}
          style={{ width: playheadCanvasWidth, height: playheadCanvasHeight }}
        />
      </div>

      <span id="frame-ticker">{store.animation.now}</span>

      <button
        type="button"
        className="jump-button noselect"
        onClick={handlePlayModeClick}
      >
        {playModeText}
      </button>
    </div>
  )
})

export default BottomMenu
