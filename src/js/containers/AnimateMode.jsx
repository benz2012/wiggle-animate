import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Viewer from './Viewer'
import Grid from '../components/Grid'
import GridItem from '../components/GridItem'
import Canvas from '../components/Canvas'

import HandleEditor from '../prototypes/HandleEditor'

@observer
class AnimateMode extends Component {
  state = {
    heWidth: undefined,
  }

  componentDidMount() {
    const { canvas } = this.props.store
    const container = document.getElementById('view-container')
    setTimeout(() => {
      const width = Math.round(container.clientWidth) - 20
      const height = Math.round((9 / 16) * width)
      canvas.setSize(width, height)
    }, 1)

    const container2 = document.getElementById('property-container')
    setTimeout(() => {
      const width = Math.round(container2.clientWidth) - 20
      const height = Math.round(container2.clientHeight) - 20
      const smallestLength = Math.min(width, height)
      this.setState({ heWidth: smallestLength })
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

  handleEditorHasSize = () => {}
  // handleEditorHasSize = () => {
  //   const handleEditor = new HandleEditor(
  //     this.state.heWidth,
  //     this.props.store.canvas.animatables.circle1.keyframes.scale[0],
  //     this.props.store.canvas.animatables.circle1.keyframes.scale[1]
  //   )
  //   handleEditor.attatchTo('handle-editor')
  //   handleEditor.init()
  // }

  render() {
    const { canvas, animation } = this.props.store
    const { heWidth } = this.state
    return (
      <Grid
        gridTemplateRows="auto 340px"
        gridTemplateColumns="auto 400px"
      >
        <GridItem id="view-container" padding="10px" gridArea="1 / 1 / 1 / 2">
          <Viewer canvas={canvas} animation={animation} setup={this.setup} />
        </GridItem>
        <GridItem id="property-container" padding="10px" gridArea="1 / 2 / 1 / 3" backgroundColor="rgb(210, 210, 210)">
          <div>Handle Editor</div>
          <Canvas
            id="handle-editor"
            width={heWidth}
            height={heWidth}
            hasSize={this.handleEditorHasSize}
          />
        </GridItem>
        <GridItem gridArea="2 / 1 / 2 / 3" backgroundColor="rgb(180, 180, 180)">
          <div>KeyframeEditor</div>
        </GridItem>
      </Grid>
    )
  }
}

export default AnimateMode
