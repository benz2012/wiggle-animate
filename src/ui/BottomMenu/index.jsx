/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useState } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'

import './BottomMenu.css'
import OpenCloseTabButton from './OpenCloseTabButton'
import PlayControls from './PlayControls'
import PlayheadCanvas from './PlayheadCanvas'
import KeyframeEditor from './KeyframeEditor'
import myTheme from '../theme'
import Animation from '../../lib/animation/Animation'
import { doesBottomMenuHaveFocus } from '../KeyHandler'

const PANEL_OPEN_HEIGHT = 300
const elevationFourBoxShadowNorth = '0px -3px 3px -2px rgba(0,0,0,0.2),'
  + '0px -3px 4px 0px rgba(0,0,0,0.14),0px -1px 8px 0px rgba(0,0,0,0.12)'

const BottomMenu = observer(({ store, windowWidth }) => {
  const { build, animation, rootContainer } = store

  const [bottomOpen, setBottomOpen] = useState(false)

  const playModeText = animation.mode

  const handlePlayPauseClick = action(() => {
    if (animation.playing) {
      animation.pause()
    } else {
      animation.play()
    }
  })

  const handlePlayModeClick = action(() => {
    /* eslint-disable no-param-reassign */
    if (animation.mode === Animation.PLAYBACK_MODES[0]) {
      animation.mode = Animation.PLAYBACK_MODES[1]
    } else if (animation.mode === Animation.PLAYBACK_MODES[1]) {
      animation.mode = Animation.PLAYBACK_MODES[0]
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <OpenCloseTabButton open={bottomOpen} setOpen={setBottomOpen} />

        <PlayControls
          isPlaying={animation.playing}
          playPauseClick={handlePlayPauseClick}
          goToFirst={() => { animation.goToFirst() }}
          goToLast={() => { animation.goToLast() }}
        />

        <PlayheadCanvas store={store} windowWidth={windowWidth} />

        <span id="frame-ticker" className="noselect">{animation.now}</span>

        <button
          type="button"
          id="play-mode-button"
          className="jump-button noselect"
          onClick={handlePlayModeClick}
        >
          {playModeText}
        </button>
      </Box>

      {bottomOpen && (
        <KeyframeEditor
          store={store}
        />
      )}

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
