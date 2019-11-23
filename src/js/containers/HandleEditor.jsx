import React from 'react'
import { observer } from 'mobx-react'

import Canvas from '../components/Canvas'

import HandleEditorInstance from '../prototypes/HandleEditor'

@observer
class HandleEditor extends React.Component {
  state = {}

  handleEditor

  componentDidUpdate(prevProps) {
    if (prevProps.keyframeKey !== undefined && prevProps.keyframeKey !== this.props.keyframeKey) {
      if (this.handleEditor) this.handleEditor.destroy()
      this.buildHandleEditorCanvas()
    }
  }

  handleEditorHasSize = () => {
    this.buildHandleEditorCanvas()
  }

  buildHandleEditorCanvas = () => {
    const { width, keyframeBefore, keyframeAfter, onMove } = this.props

    if (keyframeBefore && keyframeAfter) {
      this.handleEditor = new HandleEditorInstance(width, keyframeBefore, keyframeAfter, onMove)
      this.handleEditor.attatchTo('handle-editor')
      this.handleEditor.init()
    }
  }

  render() {
    const { width, keyframeKey, keyframeBefore, keyframeAfter } = this.props

    if (keyframeKey === undefined) {
      return (
        <h3 style={{ padding: '10px', color: 'darkgray' }}>
          Select a Keyframe on the Timeline.
        </h3>
      )
    }

    if (keyframeBefore && !keyframeAfter) {
      return (
        <h3 style={{ padding: '10px', color: 'darkgray' }}>
          <i>Selected tail Keyframe has no handle relationships.</i>
        </h3>
      )
    }

    return (
      <div style={{ padding: '10px' }}>
        <Canvas
          id="handle-editor"
          width={width}
          height={width}
          hasSize={this.handleEditorHasSize}
        />
      </div>
    )
  }
}

export default HandleEditor
