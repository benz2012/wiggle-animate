import React, { Component } from 'react'
import Picker from 'vanilla-picker'

class ColorPicker extends Component {
  picker
  el = React.createRef()

  componentDidMount() {
    const { value } = this.props
    this.picker = new Picker({
      parent: this.el.current,
      popup: false,
      alpha: false,
      editor: false,
      color: value,
      onDone: this.onDone,
    })
  }

  componentWillUnmount() {
    if (this.picker) this.picker.destroy()
  }

  onDone = (color) => {
    this.props.setValue(color.rgbString)
  }

  render() {
    return (
      <div ref={this.el} />
    )
  }
}

export default ColorPicker
