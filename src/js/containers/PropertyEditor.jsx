// encapsulates ValueEditor, implements editing the paper properties of an AnimatibleItem

import React, { Component } from 'react'
import { observer } from 'mobx-react'

import IntegerInput from '../components/IntegerInput'

@observer
class PropertyEditor extends Component {
  propertySetter = property => (value) => {
    const { item, now } = this.props

    if (item.keyframes[property] && item.keyframes[property].length) {
      const existingKeyframe = item.keyframes[property].find(keyframe => keyframe.frame === now)
      if (existingKeyframe) {
        existingKeyframe.value = value
      } else {
        item.addKey(`${property}`, now, value)
      }
    } else {
      item[property] = value
    }
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

        {this.classControls()}
      </div>
    )
  }
}

export default PropertyEditor
