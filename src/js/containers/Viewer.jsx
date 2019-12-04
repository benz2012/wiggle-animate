import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Animation from '../prototypes/Animation'
import Canvas from '../components/Canvas'
import Playbar from '../components/Playbar'

@observer
class Viewer extends Component {
  canvasHasSize = () => {
    const { canvas, onSetup } = this.props
    canvas.attatchAndSetup('paper-canvas')
    onSetup()
  }

  render() {
    const { canvas, animation } = this.props
    return (
      <React.Fragment>
        <Canvas
          id="paper-canvas"
          width={canvas.width}
          height={canvas.height}
          hasSize={this.canvasHasSize}
        />
        <Playbar
          fullWidth={canvas.width}
          totalFrames={animation.frames}
          inPoint={animation.firstFrame}
          outPoint={animation.lastFrame}
          now={animation.now}
          ABSOLUTE_FIRST={Animation.FIRST}
        />
      </React.Fragment>
    )
  }
}

export default Viewer
