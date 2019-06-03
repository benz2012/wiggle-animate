import React, { Component } from 'react'

import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

class ModeController extends Component {
  navigate = (event) => {
    event.preventDefault()
    const { mode } = this.props
    mode.set(event.target.textContent.toUpperCase())
  }

  render() {
    const { current } = this.props.mode
    return (
      <Grid gridTemplateColumns="1fr 1fr 1fr 1fr" borderBottom="1px solid rgb(230, 230, 230)">
        <GridItem display="grid" alignItems="center" justifyItems="center">
          <button
            type="button"
            style={{ margin: '0px' }}
            onClick={this.navigate}
            {...(current === 'BUILD' ? { primary: 'true' } : {})}
          >
            Build
          </button>
        </GridItem>
        <GridItem display="grid" alignItems="center" justifyItems="center">
          <button
            type="button"
            style={{ margin: '0px' }}
            onClick={this.navigate}
            {...(current === 'ANIMATE' ? { primary: 'true' } : {})}
          >
            Animate
          </button>
        </GridItem>
        <GridItem display="grid" alignItems="center" justifyItems="center">
          <button
            type="button"
            style={{ margin: '0px' }}
            onClick={this.navigate}
            {...(current === 'VIEW' ? { primary: 'true' } : {})}
          >
            View
          </button>
        </GridItem>
        <GridItem display="grid" alignItems="center" justifyItems="center">
          <button
            type="button"
            style={{ margin: '0px' }}
            onClick={this.navigate}
            {...(current === 'EXPORT' ? { primary: 'true' } : {})}
          >
            Export
          </button>
        </GridItem>
      </Grid>
    )
  }
}

export default ModeController
