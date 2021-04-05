import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { autorun } from 'mobx'

import Viewer from './Viewer'
import ToolController from './ToolController'
import PropertyEditor from './PropertyEditor'
import ProjectSettings from './ProjectSettings'
import ClearProject from './ClearProject'
import Grid from '../components/Grid'
import GridItem from '../components/GridItem'

import items from '../prototypes/items'
import Keyframe from '../prototypes/Keyframe'

@observer
class BuildMode extends Component {
  state = {
    ready: false,
    inputItemsExist: false,
  }

  autorunDisposer

  componentDidMount() {
    const { canvas, project } = this.props.store
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

    this.autorunDisposer = autorun(() => {
      this.setState({ inputItemsExist: Boolean(project.inputItems) })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const prevInputItemsExist = prevState.inputItemsExist
    const { canvas, project } = this.props.store
    const { ready, inputItemsExist } = this.state
    if (
      !project.inputBuilt &&
      (
        (ready && !prevInputItemsExist && inputItemsExist) ||
        (inputItemsExist && !prevState.ready && ready)
      )
    ) {
      Object.entries(project.inputItems).forEach(([itemKey, itemObj]) => {
        const { class: itemClass, keyframes, ...properties } = itemObj

        const animatable = new items[itemClass](itemKey)
        canvas.add(animatable)

        const inputKeyframes = Object.entries(keyframes)
          .reduce((accum, [keyframeProp, keyframeList]) => {
            /* eslint no-param-reassign: 0 */
            accum[keyframeProp] = keyframeList.map(Keyframe.fromJSON)
            return accum
          }, {})
        animatable.keyframes = {
          ...this.keyframes,
          ...inputKeyframes,
        }

        Object.entries(properties).forEach(([key, value]) => {
          animatable[key] = value
        })
      })

      project.inputBuilt = true
    }
  }

  componentWillUnmount() {
    const { project, canvas } = this.props.store
    canvas.selectOff()
    project.clear()
    this.autorunDisposer()
  }

  onSetup = () => {
    const { canvas } = this.props.store
    canvas.build()
    this.setState({ ready: true })
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
        <ClearProject store={this.props.store} />
        <Grid
          gridTemplateRows="minmax(0, 1fr) 60px"
          gridTemplateColumns="auto 340px"
          // height="100%"
          maxHeight="100%"
          overflow="hidden"
        >
          <GridItem gridArea="1 / 1 / 1 / 2" id="build-container" padding="10px" alignSelf="center">
            <Viewer canvas={canvas} animation={animation} onSetup={this.onSetup} />
          </GridItem>
          <GridItem gridArea="1 / 2 / 1 / 3" backgroundColor="rgb(210, 210, 210)" maxHeight="100%" overflow="hidden">
            <PropertyEditor item={canvas.selected} now={animation.now} />
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
