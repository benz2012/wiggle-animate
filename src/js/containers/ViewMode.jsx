import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Viewer from './Viewer'
import PlayController from './PlayController'
import Grid from '../components/Grid'
import GridItem from '../components/GridItem'
import { getWidth } from '../components/withWindowSize'

import placeholder from '../prototypes/placeholder'

@observer
class ViewMode extends Component {
  componentDidMount() {
    const { canvas } = this.props.store
    const width = getWidth() - 20
    const height = Math.round((9 / 16) * width)
    canvas.setSize(width, height)

    // placeholder.setRange(this.props.store.animation)
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
        gridTemplateRows="auto 60px"
        alignItems="center"
      >
        <GridItem padding="10px">
          <Viewer canvas={canvas} animation={animation} setup={this.setup} />
        </GridItem>
        <PlayController animation={animation} />
      </Grid>
    )
  }
}

export default ViewMode
