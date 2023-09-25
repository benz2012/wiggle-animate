/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useState } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import ButtonBase from '@mui/material/ButtonBase'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import './BottomMenu.css'
import PlayheadCanvas from './PlayheadCanvas'
import Animation from '../../lib/animation/Animation'
import { doesBottomMenuHaveFocus } from '../KeyHandler'

const BottomMenu = observer(({ store, windowWidth }) => {
  // Show/Hide keyframe editing panel
  const [bottomOpen, setBottomOpen] = useState(false)

  const playPauseText = store.animation.playing ? '❙ ❙' : '▶'
  const playModeText = store.animation.mode

  const handlePlayPauseClick = action(() => {
    if (store.animation.playing) {
      store.animation.pause()
    } else {
      store.animation.play()
    }
  })

  const handlePlayModeClick = action(() => {
    /* eslint-disable no-param-reassign */
    if (store.animation.mode === Animation.PLAYBACK_MODES[0]) {
      store.animation.mode = Animation.PLAYBACK_MODES[1]
    } else if (store.animation.mode === Animation.PLAYBACK_MODES[1]) {
      store.animation.mode = Animation.PLAYBACK_MODES[0]
    }
  })

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

      <PlayheadCanvas store={store} windowWidth={windowWidth} />

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
