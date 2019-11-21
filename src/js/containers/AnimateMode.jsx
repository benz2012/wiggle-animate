import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Viewer from './Viewer'
import HandleEditor from './HandleEditor'
import KeyframeEditor from './KeyframeEditor'
import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

@observer
class AnimateMode extends Component {
  state = {
    heWidth: undefined,
    keSize: undefined,
    // TODO: move these somewhere else
    keyframeKey: undefined,
    keyframeBefore: undefined,
    keyframeAfter: undefined,
  }

  componentDidMount() {
    const { canvas } = this.props.store
    const container = document.getElementById('view-container')
    setTimeout(() => {
      const width = Math.round(container.clientWidth) - 20
      const height = Math.round((9 / 16) * width)
      canvas.setSize(width, height)
    }, 1)

    const container2 = document.getElementById('handle-container')
    setTimeout(() => {
      const width = Math.round(container2.clientWidth) - 20
      const height = Math.round(container2.clientHeight) - 20
      const smallestLength = Math.min(width, height)
      this.setState({ heWidth: smallestLength })
    }, 1)

    const container3 = document.getElementById('keyframe-container')
    setTimeout(() => {
      const width = Math.round(container3.clientWidth) - 20
      const height = Math.round(container3.clientHeight) - 20
      this.setState({ keSize: { width, height } })
    }, 1)
  }

  componentWillUnmount() {
    const { canvas, project } = this.props.store
    canvas.selectOff()
    project.clear()
  }

  setup = () => {
    const { canvas } = this.props.store
    canvas.build()
    canvas.setTool('SELECT')
  }

  setTheKeyFrame = () => {
    if (this.state.keyframeKey === undefined) {
      this.setState({
        keyframeKey: 'circle1.keyframes.scale[0]',
        keyframeBefore: this.props.store.canvas.animatables.circle1.keyframes.scale[0],
        keyframeAfter: this.props.store.canvas.animatables.circle1.keyframes.scale[1],
      })
    } else {
      this.setState({
        keyframeKey: 'circle1.keyframes.x[0]',
        keyframeBefore: this.props.store.canvas.animatables.circle1.keyframes.x[0],
        keyframeAfter: this.props.store.canvas.animatables.circle1.keyframes.x[1],
      })
    }
  }

  render() {
    const { canvas, animation } = this.props.store
    const { heWidth, keSize, keyframeKey, keyframeBefore, keyframeAfter } = this.state
    return (
      <Grid
        gridTemplateRows="auto 340px"
        gridTemplateColumns="auto 400px"
      >
        <GridItem id="view-container" padding="10px" gridArea="1 / 1 / 1 / 2">
          <Viewer canvas={canvas} animation={animation} setup={this.setup} />
        </GridItem>
        <GridItem id="handle-container" gridArea="1 / 2 / 1 / 3" backgroundColor="rgb(210, 210, 210)">
          <HandleEditor
            width={heWidth}
            keyframeKey={keyframeKey}
            keyframeBefore={keyframeBefore}
            keyframeAfter={keyframeAfter}
          />
        </GridItem>
        <GridItem id="keyframe-container" gridArea="2 / 1 / 2 / 3" backgroundColor="rgb(180, 180, 180)">
          {/* <button type="button" onClick={this.setTheKeyFrame}>I&#39;m a keyframe</button> */}
          <KeyframeEditor
            size={keSize}
            // selected={selected}
            item={canvas.selected}
          />
        </GridItem>
      </Grid>
    )
  }
}

export default AnimateMode
