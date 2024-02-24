import './BottomMenu.css'

// TODO [4]: use material components & icons on play control buttons

const PlayControls = ({ isPlaying, playPauseClick, goToFirst, goToLast }) => (
  <div id="play-controls">
    <button
      type="button"
      id="jump-start-button"
      className="jump-button noselect"
      onClick={goToFirst}
    >
      ⇤
    </button>
    <button
      type="button"
      id="play-pause-button"
      className="jump-button font-12 noselect"
      onClick={playPauseClick}
    >
      {isPlaying ? '❙ ❙' : '▶'}
    </button>
    <button
      type="button"
      id="jump-end-button"
      className="jump-button noselect"
      onClick={goToLast}
    >
      ⇥
    </button>
  </div>
)

export default PlayControls
