import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Circle from '../prototypes/items/Circle'
import Rectangle from '../prototypes/items/Rectangle'

@observer
class ToolController extends Component {
  choose = (event) => {
    event.preventDefault()
    this.props.setTool(event.currentTarget.id)
  }

  addCircle = () => {
    const { existing } = this.props
    const circle = new Circle(`circle-${Object.keys(existing).length}`)
    this.props.add(circle)
  }

  addRectangle = () => {
    const { existing } = this.props
    const rect = new Rectangle(`rect-${Object.keys(existing).length}`)
    this.props.add(rect)
  }

  render() {
    const { tool } = this.props

    return (
      <div style={{ display: 'flex', padding: '10px 10px 0px 10px' }}>
        <button
          type="button"
          id="SETTINGS"
          onClick={this.choose}
          {...(tool === 'SETTINGS' ? { primary: 'true' } : {})}
        >
          <div>&#9776;</div>
        </button>
        <button
          type="button"
          id="CLEAR"
          onClick={this.choose}
        >
          <div>&#10007;</div>
        </button>
        <button
          type="button"
          id="SELECT"
          onClick={this.choose}
          {...(tool === 'SELECT' ? { primary: 'true' } : {})}
        >
          <div style={{ transform: 'rotate(-135deg)' }}>&#10148;</div>
        </button>
        {/* <button
          type="button"
          id="DRAW"
          onClick={this.choose}
          {...(tool === 'DRAW' ? { primary: 'true' } : {})}
        >
          ✎
        </button> */}

        <button type="button" onClick={this.addCircle}>+ Circle</button>
        <button type="button" onClick={this.addRectangle}>+ Rectangle</button>
      </div>
    )
  }
}

export default ToolController
