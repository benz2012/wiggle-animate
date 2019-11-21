import React from 'react'
import { observer } from 'mobx-react'

import Canvas from '../components/Canvas'

@observer
class KeyframeEditor extends React.Component {
  keyframeEditor

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== undefined && prevProps.selected !== this.props.selected) {
      if (this.keyframeEditor) this.keyframeEditor.destroy()
      this.buildKeyframeEditorCanvas()
    }
  }

  keyframeEditorHasSize = () => {
    this.buildKeyframeEditorCanvas()
  }

  buildKeyframeEditorCanvas = () => {
    const { width, item } = this.props
    // this.keyframeEditor = new KeyframeEditorInstance(width, keyframeBefore, keyframeAfter)
    // this.keyframeEditor.attatchTo('keyframe-editor')
    // this.keyframeEditor.init()
  }

  render() {
    const { size, selected } = this.props

    if (selected === undefined) {
      return (
        <h3 style={{ padding: '10px', color: 'grey' }}>
          Select an Item to view its Keyframes.
        </h3>
      )
    }

    return (
      <div style={{ padding: '10px' }}>
        <Canvas
          id="keyframe-editor"
          width={size.width}
          height={size.height}
          hasSize={this.keyframeEditorHasSize}
        />
      </div>
    )
  }
}

export default KeyframeEditor
