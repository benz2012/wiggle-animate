import React, { Component } from 'react'
import { observer } from 'mobx-react'

import items from '../prototypes/items'

@observer
class ToolController extends Component {
  choose = (event) => {
    event.preventDefault()
    this.props.setTool(event.currentTarget.id)
  }

  addCircle = () => {
    const { existing } = this.props
    const circle = new items.Circle(`circle-${Object.keys(existing).length}`)
    this.props.add(circle)
  }

  addRectangle = () => {
    const { existing } = this.props
    const rect = new items.Rectangle(`rect-${Object.keys(existing).length}`)
    this.props.add(rect)
  }

  addText = () => {
    const { existing } = this.props
    const text = new items.Text(`text-${Object.keys(existing).length}`)
    this.props.add(text)
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
        <button type="button" onClick={this.addText}>+ Text</button>
      </div>
    )
  }
}

export default ToolController
