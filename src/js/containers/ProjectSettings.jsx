import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Modal from '../components/Modal'

@observer
class ProjectSettings extends Component {
  setName = (event) => {
    const { store } = this.props
    store.project.setName(event.target.value)
  }

  setLength = (event) => {
    const { store } = this.props
    const length = parseInt(event.target.value)
    store.animation.setLength(length)
  }

  setColor = (event) => {
    const { store } = this.props
    store.canvas.color = event.target.value
  }

  closeModal = () => this.props.store.canvas.setTool('SELECT')

  render() {
    const { store } = this.props

    return (
      <Modal open={store.mode.settings} handleClose={this.closeModal}>
        <h3>Project Settings</h3>

        <label>Project Name</label>
        <input type="text" value={store.project.name} onChange={this.setName} />

        <label>Animation Length</label>
        <input type="number" step="1" value={store.animation.frames} onChange={this.setLength} />

        <label>Canvas Background</label>
        <select value={store.canvas.color} onChange={this.setColor}>
          <option value="#000000">Black</option>
          <option value="#ffffff">White</option>
        </select>

        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <button type="button" onClick={this.closeModal}>Close</button>
        </div>
      </Modal>
    )
  }
}

export default ProjectSettings
