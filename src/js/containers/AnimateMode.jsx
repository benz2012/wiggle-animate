import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Viewer from './Viewer'
import HandleEditor from './HandleEditor'
import KeyframeEditor from './KeyframeEditor'
import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

import { titleCase } from '../util/string'

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
    const { canvas, project, tools } = this.props.store
    canvas.selectOff()
    project.clear()
    tools.selectKeyframe(undefined)
  }

  setup = () => {
    const { canvas } = this.props.store
    canvas.build()
    setTimeout(() => {
      canvas.setTool(undefined)
      canvas.setTool('SELECT')
    }, 20)
  }

  changeHandlePosition = (handleType, { influence, distance }) => {
    const { tools, canvas } = this.props.store
    if (!tools.selectedKeyframe) return

    const handleSuffix = titleCase(handleType)
    const [kItem, kProp, kIndexStr] = tools.selectedKeyframe.split('.')
    let kIndex = parseInt(kIndexStr)
    if (handleType === 'IN') {
      kIndex += 1
    }

    const targetHandle = canvas.animatables[kItem].keyframes[kProp][kIndex][`handle${handleSuffix}`]
    let auxilaryHandle
    if (kProp === 'x') {
      auxilaryHandle = canvas.animatables[kItem].keyframes.y[kIndex][`handle${handleSuffix}`]
    }

    targetHandle.influence += influence
    targetHandle.distance += distance

    if (auxilaryHandle) {
      auxilaryHandle.influence += influence
      auxilaryHandle.distance += distance
    }
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
            onMove={this.changeHandlePosition}
          />
        </GridItem>
        <GridItem id="keyframe-container" gridArea="2 / 1 / 2 / 3" backgroundColor="rgb(180, 180, 180)">
          <KeyframeEditor
            size={keSize}
            item={canvas.selected}
            keyframeKey={tools.selectedKeyframe}
            keyframe={keyframeBefore}
            onSelect={tools.selectKeyframe}
            frames={animation.frames}
            now={animation.now}
          />
        </GridItem>
      </Grid>
    )
  }
}

export default AnimateMode
