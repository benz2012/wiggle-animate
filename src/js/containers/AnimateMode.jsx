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
    setTimeout(() => {
      canvas.setTool(undefined)
      canvas.setTool('SELECT')
    }, 20)
  }

  render() {
    const { canvas, animation, tools } = this.props.store
    const { heWidth, keSize } = this.state

    let keyframeBefore
    let keyframeAfter
    if (tools.selectedKeyframe) {
      const [kItem, kProp, kIndexStr] = tools.selectedKeyframe.split('.')
      const kIndex = parseInt(kIndexStr)
      const keyframesOfType = canvas.animatables[kItem].keyframes[kProp]
      keyframeBefore = keyframesOfType[kIndex]
      if (kIndex + 1 < keyframesOfType.length) {
        keyframeAfter = keyframesOfType[kIndex + 1]
      }
    }

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
            keyframeKey={tools.selectedKeyframe}
            keyframeBefore={keyframeBefore}
            keyframeAfter={keyframeAfter}
          />
        </GridItem>
        <GridItem id="keyframe-container" gridArea="2 / 1 / 2 / 3" backgroundColor="rgb(180, 180, 180)">
          <KeyframeEditor
            size={keSize}
            item={canvas.selected}
            frames={animation.frames}
            now={animation.now}
            onSelect={tools.selectKeyframe}
          />
        </GridItem>
      </Grid>
    )
  }
}

export default AnimateMode
