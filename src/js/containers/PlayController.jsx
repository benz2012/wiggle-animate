import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

@observer
class PlayController extends Component {
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, false)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false)
  }

  handleKeyDown = (event) => {
    const {
      play,
      pause,
      goToNext,
      goToPrev,
      goToFirst,
      goToLast,
      playing,
    } = this.props.animation
    const { key, shiftKey } = event

    if (key === 'ArrowLeft' && shiftKey) {
      goToFirst()
    } else if (key === 'ArrowLeft') {
      goToPrev()
    } else if (key === 'ArrowRight' && shiftKey) {
      goToLast()
    } else if (key === 'ArrowRight') {
      goToNext()
    } else if (key === ' ') {
      event.stopPropagation()
      event.preventDefault()
      if (playing === true) {
        pause()
      } else {
        play()
      }
    }
  }

  render() {
    const {
      play,
      pause,
      goToNext,
      goToPrev,
      goToFirst,
      goToLast,
      playing,
    } = this.props.animation

    return (
      <Grid gridTemplateColumns="30% 1fr 1fr 1fr 1fr 1fr 30%" height="60px" alignItems="center" justifyItems="center" borderTop="1px solid rgb(230, 230, 230)">
        <GridItem gridColumnStart="2">
          <button type="button" style={{ margin: 0 }} onClick={goToFirst}>&#8676;</button>
        </GridItem>
        <GridItem gridColumnStart="3">
          <button type="button" style={{ margin: 0 }} onClick={goToPrev}>&#9667;</button>
        </GridItem>
        <GridItem gridColumnStart="4">
          { playing === false ?
            <button type="button" style={{ margin: 0 }} onClick={play}>&#9658;</button> :
            <button type="button" style={{ margin: 0 }} onClick={pause}>&#10073; &#10073;</button>
          }
        </GridItem>
        <GridItem gridColumnStart="5">
          <button type="button" style={{ margin: 0 }} onClick={goToNext}>
            <div style={{ transform: 'rotate(180deg)' }}>&#9667;</div>
          </button>
        </GridItem>
        <GridItem gridColumnStart="6">
          <button type="button" style={{ margin: 0 }} onClick={goToLast}>&#8677;</button>
        </GridItem>
      </Grid>
    )
  }
}

export default PlayController
