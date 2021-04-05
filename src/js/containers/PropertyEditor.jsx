// encapsulates ValueEditor, implements editing the paper properties of an AnimatibleItem

import React, { Component } from 'react'
import { observer } from 'mobx-react'

import IntegerInput from '../components/IntegerInput'
import TextInput from '../components/TextInput'
import ColorPicker from '../components/ColorPicker'

@observer
class PropertyEditor extends Component {
  propertySetter = (property) => {
    const { item, now } = this.props
    return value => item.setPropertyAtTime(property, value, now)
  }

  classControls() {
    const { item } = this.props
    const itemClass = item.constructor.name

    if (itemClass === 'Circle') {
      return (
        <React.Fragment>
          <label>Radius</label>
          <div style={{ display: 'flex' }}>
            <IntegerInput value={item.radius} setValue={this.propertySetter('radius')} />
          </div>
        </React.Fragment>
      )
    }

    if (itemClass === 'Rectangle') {
      return (
        <React.Fragment>
          <label>Size</label>
          <div style={{ display: 'flex' }}>
            <IntegerInput value={item.width} setValue={this.propertySetter('width')} />
            <IntegerInput value={item.height} setValue={this.propertySetter('height')} />
          </div>
          <label>Corner Radius</label>
          <div style={{ display: 'flex' }}>
            <IntegerInput value={item.radius} setValue={this.propertySetter('radius')} />
          </div>
        </React.Fragment>
      )
    }

    if (itemClass === 'Text') {
      return (
        <React.Fragment>
          <label>Content</label>
          <div style={{ display: 'flex' }}>
            <TextInput value={item.content} setValue={this.propertySetter('content')} />
          </div>
          <label>Font Size</label>
          <div style={{ display: 'flex' }}>
            <IntegerInput value={item.fontSize} setValue={this.propertySetter('fontSize')} />
          </div>
        </React.Fragment>
      )
    }
  }

  render() {
    const { item } = this.props

    if (item === undefined) {
      return (
        <h3 style={{ padding: '10px', color: 'darkgray' }}>
          Select an Item on the Canvas.
        </h3>
      )
    }

    return (
      <div style={{ padding: '10px' }}>
        <h4>{item.key}</h4>
        <label>Position</label>
        <div style={{ display: 'flex' }}>
          <IntegerInput value={item.x} setValue={this.propertySetter('x')} />
          <IntegerInput value={item.y} setValue={this.propertySetter('y')} />
        </div>

        <label>Scale</label>
        <div style={{ display: 'flex' }}>
          <IntegerInput value={item.scale} setValue={this.propertySetter('scale')} />
        </div>

        <label>Rotation</label>
        <div style={{ display: 'flex' }}>
          <IntegerInput value={item.rotation} setValue={this.propertySetter('rotation')} />
        </div>

        <label>Fill Color</label>
        <div style={{ display: 'flex' }}>
          <ColorPicker value={item.fillColor} setValue={this.propertySetter('fillColor')} />
        </div>

        {this.classControls()}
      </div>
    )
  }
}

export default PropertyEditor
