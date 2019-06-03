import React, { Component } from 'react'
import { observer } from 'mobx-react'

@observer
class Canvas extends Component {
  componentDidUpdate(prevProps) {
    const { width, hasSize } = this.props
    if (prevProps.width === undefined && width !== undefined) {
      hasSize()
    }
  }

  render() {
    const { id, width, height } = this.props
    if (width === undefined) return null
    return (
      <canvas
        style={{ display: 'block' }}
        id={id}
        width={width}
        height={height}
      />
    )
  }
}

export default Canvas
