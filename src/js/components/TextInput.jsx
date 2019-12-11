import React, { Component } from 'react'
import { observer } from 'mobx-react'

@observer
class TextInput extends Component {
  onChange = (event) => {
    const { setValue } = this.props
    setValue(event.target.value)
  }

  render() {
    const { value } = this.props
    return (
      <input
        type="text"
        style={{ width: '100%', marginRight: '20px', textAlign: 'left' }}
        value={value}
        onChange={this.onChange}
      />
    )
  }
}

export default TextInput
