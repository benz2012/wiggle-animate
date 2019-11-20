/* eslint react/sort-comp: 0 */

import React, { Component } from 'react'
import { observer } from 'mobx-react'

@observer
class IntegerInput extends Component {
  state = {
    localValue: 0,
  }

  componentDidMount() {
    const { item, property } = this.props
    if (item[property] !== this.state.localValue) {
      this.setState({ localValue: item[property] })
    }
  }

  onChange = (event) => {
    this.setState({ localValue: event.target.value })
  }

  onBlur = () => {
    const { item, property } = this.props
    const { localValue } = this.state

    const possibleInt = parseInt(localValue)
    let result = item[property]
    if (Number.isInteger(possibleInt)) {
      result = possibleInt
    }

    item[property] = result
    this.setState({ localValue: result })
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

  changeBy = operation => (amount) => {
    const { item, property } = this.props
    const current = item[property]
    const next = operation(current, amount)
    item[property] = next
    this.setState({ localValue: next })
  }

  incrementBy = this.changeBy((a, b) => a + b)
  decrementBy = this.changeBy((a, b) => a - b)

  render() {
    const { localValue } = this.state
    return (
      <input
        type="text"
        style={{ width: '60px', marginRight: '20px', textAlign: 'center' }}
        value={localValue}
        onChange={this.onChange}
        onKeyDown={this.handleKeyDown}
        onBlur={this.onBlur}
      />
    )
  }
}

export default IntegerInput
