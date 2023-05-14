import { useCallback, useEffect, useRef } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'

import './BottomMenu.css'
import { identityMatrix } from '../utility/matrix'

const BottomMenu = observer(({ store, windowWidth }) => {
  const playheadRef = useRef()
  const playheadCanvasWidth = windowWidth - 143
  const playheadCanvasHeight = 40
  const playheadWidth = 24

  const playPauseText = store.animation.playing ? '❙ ❙' : '▶'

  const drawPlayhead = useCallback((ctx) => {
    const thinLineOffset = store.DPR === 1 ? 0.5 : 0
    ctx.translate(thinLineOffset, -thinLineOffset)

    ctx.beginPath()
    ctx.fillStyle = 'rgba(25, 117, 210, 1)'
    ctx.strokeStyle = 'rgba(13, 71, 161, 1)'
    ctx.lineWidth = 4
    const upperWidth = playheadWidth
    const playheadLeft = 2
    ctx.moveTo(playheadLeft, 6)
    ctx.lineTo(upperWidth / 2 + playheadLeft, 20)
    ctx.lineTo(upperWidth + playheadLeft, 6)
    ctx.lineTo(upperWidth + playheadLeft, -24)
    ctx.lineTo(playheadLeft, -24)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()

    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(13, 71, 161, 0.5)'
    ctx.moveTo(playheadLeft + upperWidth / 4, 0)
    ctx.lineTo(playheadLeft + upperWidth / 4, -14)
    ctx.moveTo(playheadLeft + (upperWidth / 4) * 2, 4)
    ctx.lineTo(playheadLeft + (upperWidth / 4) * 2, -18)
    ctx.moveTo(playheadLeft + (upperWidth / 4) * 3, 0)
    ctx.lineTo(playheadLeft + (upperWidth / 4) * 3, -14)
    ctx.stroke()
  }, [store.DPR])

  useEffect(() => {
    const canvas = playheadRef.current
    const ctx = canvas.getContext('2d')
    const { width: canvasWidth, height: canvasHeight } = canvas

    ctx.setTransform(identityMatrix())
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    // TODO: remove after debugging
    // ctx.beginPath()
    // ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
    // ctx.fillRect(0, 0, canvasWidth - 10, canvasHeight)
    ctx.translate(0, canvasHeight / 2 + 1)
    ctx.scale(store.DPR / 2, store.DPR / 2)

    const pixelsPerFrame = (canvasWidth - playheadWidth) / store.animation.frames
    ctx.translate(pixelsPerFrame * (store.animation.now - 1), 0)
    drawPlayhead(ctx)
  }, [
    drawPlayhead,
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

  return (
    <div id="bottom-menu">
      <button type="button" id="bottom-menu-tab" className="noselect">▲</button>
      <div id="play-controls">
        <button type="button" className="jump-button noselect" onClick={action(() => { store.animation.goToFirst() })}>⇤</button>
        <button
          type="button"
          className="jump-button font-12 noselect"
          onClick={handlePlayPauseClick}
        >
          {playPauseText}
        </button>
        <button type="button" className="jump-button noselect" onClick={action(() => { store.animation.goToLast() })}>⇥</button>
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
    </div>
  )
})

export default BottomMenu
