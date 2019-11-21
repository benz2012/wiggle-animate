import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Viewer from './Viewer'
import ToolController from './ToolController'
import PropertyEditor from './PropertyEditor'
import ProjectSettings from './ProjectSettings'
import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

import placeholder from '../prototypes/placeholder'

@observer
class BuildMode extends Component {
  state = {
    ready: false,
  }

  componentDidMount() {
    const { canvas } = this.props.store
    const container = document.getElementById('build-container')
    setTimeout(() => {
      const width = Math.round(container.clientWidth) - 20
      const height = Math.round((9 / 16) * width)
      canvas.setSize(width, height)
    }, 1)

    if (canvas.tool === 'SELECT') {
      setTimeout(() => {
        canvas.setTool(undefined)
        canvas.setTool('SELECT')
      }, 20)
    }
  }

  componentWillUnmount() {
    const { project, canvas } = this.props.store
    canvas.selectOff()
    project.clear()
  }

  setup = () => {
    this.setState({ ready: true })
    const { canvas } = this.props.store
    canvas.build()

    // placeholder.setLength(this.props.store.animation)
    // placeholder.setRange(this.props.store.animation)
    // placeholder.addItems(canvas)
  }

  add = (item) => {
    const { canvas } = this.props.store
    canvas.add(item)
  }

  render() {
    const { canvas, animation } = this.props.store
    const { ready } = this.state
    return (
      <React.Fragment>
        <ProjectSettings store={this.props.store} />
        <Grid
          gridTemplateRows="auto 60px"
          gridTemplateColumns="auto 340px"
        >
          <GridItem gridArea="1 / 1 / 1 / 2" id="build-container" padding="10px" alignSelf="center">
            <Viewer canvas={canvas} animation={animation} setup={this.setup} />
          </GridItem>
          <GridItem gridArea="1 / 2 / 1 / 3" backgroundColor="rgb(210, 210, 210)">
            { canvas && (
              <PropertyEditor item={canvas.selected} now={animation.now} />
            )}
          </GridItem>
          <GridItem gridArea="2 / 1 / 2 / 3" backgroundColor="rgb(180, 180, 180)">
            { ready && (
              <ToolController
                existing={canvas.animatables}
                add={this.add}
                tool={canvas.tool}
                setTool={canvas.setTool}
              />
            )}
          </GridItem>
        </Grid>
      </React.Fragment>
    )
  }
}

export default BuildMode
