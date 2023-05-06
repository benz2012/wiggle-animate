import { useEffect, useRef, useState } from 'react'
import './BottomMenu.css'

const identityMatrix = () => new DOMMatrix([1, 0, 0, 1, 0, 0])

const BottomMenu = ({ store, windowWidth }) => {
  const playheadRef = useRef()
  const playheadCanvasWidth = windowWidth - 108
  const playheadCanvasHeight = 40

  const [isPlaying, setIsPlaying] = useState(false)
  const playPauseText = isPlaying ? '❙ ❙' : '▶'

  const drawPlayhead = (ctx) => {
    ctx.beginPath()
    ctx.fillStyle = 'rgba(25, 117, 210, 1)'
    ctx.strokeStyle = 'rgba(13, 71, 161, 1)'
    ctx.lineWidth = 4
    const upperWidth = 24
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
    ctx.moveTo(playheadLeft + upperWidth / 3, 2)
    ctx.lineTo(playheadLeft + upperWidth / 3, -16)
    ctx.moveTo(playheadLeft + (upperWidth / 3) * 2, 2)
    ctx.lineTo(playheadLeft + (upperWidth / 3) * 2, -16)
    ctx.stroke()
  }

  useEffect(() => {
    const canvas = playheadRef.current
    const ctx = canvas.getContext('2d')
    const { width: canvasWidth, height: canvasHeight } = canvas

    ctx.setTransform(identityMatrix())
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.translate(0, canvasHeight / 2 + 1)

    drawPlayhead(ctx)
  }, [playheadRef.current])

  return (
    <div id="bottom-menu">
      <button type="button" id="bottom-menu-tab" className="noselect">▲</button>
      <div id="play-controls">
        <button type="button" className="jump-button noselect">⇤</button>
        <button
          type="button"
          className="jump-button font-12 noselect"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {playPauseText}
        </button>
        <button type="button" className="jump-button noselect">⇥</button>
      </div>
      <div id="timeline-container">
        <div id="timeline-horizontal-line" />
        <canvas
          ref={playheadRef}
          id="playhead-canvas"
          width={playheadCanvasWidth * store.DPR}
          height={playheadCanvasHeight * store.DPR}
          style={{ width: playheadCanvasWidth, height: playheadCanvasHeight }}
        />
      </div>
    </div>
  )
}

export default BottomMenu
