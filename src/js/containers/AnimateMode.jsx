import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Viewer from './Viewer'
import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

@observer
class AnimateMode extends Component {
  componentDidMount() {
    const { canvas } = this.props.store
    const container = document.getElementById('view-container')
    setTimeout(() => {
      const width = Math.round(container.clientWidth) - 20
      const height = Math.round((9 / 16) * width)
      canvas.setSize(width, height)
    }, 1)
  }

  componentWillUnmount() {
    const { project } = this.props.store
    project.clear()
  }

  setup = () => {
    const { canvas } = this.props.store
    canvas.build()
  }

  render() {
    const { canvas, animation } = this.props.store
    return (
      <Grid
        gridTemplateRows="auto 340px"
        gridTemplateColumns="auto 400px"
      >
        <GridItem id="view-container" padding="10px" gridArea="1 / 1 / 1 / 2">
          <Viewer canvas={canvas} animation={animation} setup={this.setup} />
        </GridItem>
        <GridItem gridArea="1 / 2 / 1 / 3" backgroundColor="rgb(210, 210, 210)">
          <div>ProprertyEditor</div>
        </GridItem>
        <GridItem gridArea="2 / 1 / 2 / 3" backgroundColor="rgb(180, 180, 180)">
          <div>KeyframeEditor</div>
        </GridItem>
      </Grid>
    )
  }
}

export default AnimateMode
