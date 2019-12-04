import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Modal from '../components/Modal'

@observer
class ClearProject extends Component {
  closeModal = () => this.props.store.canvas.setTool('SELECT')

  render() {
    const { store } = this.props
    const { mode, project, reset } = store

    return (
      <Modal open={mode.clear} handleClose={this.closeModal}>
        <h3>Remove Project?</h3>

        <p>
          You are about to remove&nbsp;
          <strong>{project.name}</strong>
          &nbsp;from your workspace, and start from scratch.
          Are you sure you want to do this?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={this.closeModal}>Cancel</button>
          <button type="button" onClick={reset}>Remove</button>
        </div>
      </Modal>
    )
  }
}

export default ClearProject
