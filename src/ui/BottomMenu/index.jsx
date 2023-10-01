/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useState } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import './BottomMenu.css'
import PlayheadCanvas from './PlayheadCanvas'
import myTheme from '../theme'
import Animation from '../../lib/animation/Animation'
import { doesBottomMenuHaveFocus } from '../KeyHandler'

const PANEL_OPEN_HEIGHT = 300
const elevationFourBoxShadowNorth = '0px -3px 3px -2px rgba(0,0,0,0.2),'
  + '0px -3px 4px 0px rgba(0,0,0,0.14),0px -1px 8px 0px rgba(0,0,0,0.12)'

const BottomMenu = observer(({ store, windowWidth }) => {
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
    <Box
      id="bottom-menu"
      tabIndex="0"
      sx={(theme) => ({
        height: bottomOpen ? `${PANEL_OPEN_HEIGHT}px` : '24px',
        backgroundColor: bottomOpen ? `${myTheme.palette.background.main}` : `${myTheme.palette.primary_dark[20]}`,
        transition: `height ${theme.transitions.duration.short}ms,
          background-color ${theme.transitions.duration.short}ms`,
        boxShadow: bottomOpen ? elevationFourBoxShadowNorth : 'none',
      })}
    >
      <ButtonBase
        id="bottom-menu-tab"
        onClick={() => setBottomOpen(!bottomOpen)}
        focusRipple
        sx={{
          backgroundColor: bottomOpen ? `${myTheme.palette.background.main}` : `${myTheme.palette.primary_dark[20]}`,
          '&:hover': {
            backgroundColor: bottomOpen
              ? `${myTheme.palette.background.lighter1}`
              : `${myTheme.palette.primary_dark[30]}`,
          },
          '&:active': {
            backgroundColor: bottomOpen
              ? `${myTheme.palette.background.lighter1}`
              : `${myTheme.palette.primary_dark[30]}`,
          },
        }}
      >
        <KeyboardArrowUpIcon
          sx={(theme) => ({
            transition: `transform ${theme.transitions.duration.shorter}ms`,
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
    </Box>
  )
})

export default BottomMenu
