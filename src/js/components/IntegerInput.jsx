import React, { Component } from 'react'
import { observer } from 'mobx-react'

@observer
class IntegerInput extends Component {
  inputRef = React.createRef()

  componentDidMount() {
    this.inputRef.current.addEventListener('keydown', this.handleKeyDown, false)
  }

  componentWillUnmount() {
    this.inputRef.current.removeEventListener('keydown', this.handleKeyDown, false)
  }

  onChange = (event) => {
    const { item, property } = this.props
    item[property] = parseInt(event.target.value)
  }

  handleKeyDown = (event) => {
    const { key, shiftKey } = event
    if (key === 'ArrowUp' && shiftKey) {
      this.incrementBy(10)
    } else if (key === 'ArrowUp') {
      this.incrementBy(1)
    } else if (key === 'ArrowDown' && shiftKey) {
      this.decrementBy(10)
    } else if (key === 'ArrowDown') {
      this.decrementBy(1)
    }
  }

  incrementBy = (amount) => {
    const { item, property, response } = this.props
    item[property] += amount
    response()
  }

  decrementBy = (amount) => {
    const { item, property, response } = this.props
    item[property] -= amount
    response()
  }

  render() {
    const { item, property, response } = this.props
    return (
      <input
        ref={this.inputRef}
        type="text"
        style={{ width: '60px', marginRight: '20px', textAlign: 'center' }}
        value={item[property]}
        onChange={this.onChange}
        onBlur={response}
      />
    )
  }
}

export default IntegerInput
