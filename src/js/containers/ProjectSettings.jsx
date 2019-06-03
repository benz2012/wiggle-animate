import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Modal from '../components/Modal'

@observer
class ProjectSettings extends Component {
  setName = (event) => {
    const { store } = this.props
    store.project.setName(event.target.value)
  }

  toggleSettings = () => this.props.store.mode.toggleSettings()

  render() {
    const { store } = this.props
    return (
      <Modal open={store.mode.settings} handleClose={this.toggleSettings}>
        <h3>Project Settings</h3>
        <label>Project Name</label>
        <input type="text" value={store.project.name} onChange={this.setName} />
      </Modal>
    )
  }
}

export default ProjectSettings


// Settings

// Project:
// - Name
// Animation:
// - Length
// Canvas:
// - backgroundColor
