// encapsulates ValueEditor, implements editing the paper properties of an AnimatibleItem

import React, { Component } from 'react'
import { observer } from 'mobx-react'

import IntegerInput from '../components/IntegerInput'

@observer
class PropertyEditor extends Component {
  classControls() {
    const { item, draw } = this.props
    const itemClass = item.constructor.name

    if (itemClass === 'Circle') {
      return (
        <React.Fragment>
          <label>Radius</label>
          <div style={{ display: 'flex' }}>
            <IntegerInput
              item={item}
              property="radius"
              response={draw}
            />
          </div>
        </React.Fragment>
      )
    }

    if (itemClass === 'Rectangle') {
      return (
        <React.Fragment>
          <label>Size</label>
          <div style={{ display: 'flex' }}>
            <IntegerInput
              item={item}
              property="width"
              response={draw}
            />
            <IntegerInput
              item={item}
              property="height"
              response={draw}
            />
          </div>
        </React.Fragment>
      )
    }
  }

  render() {
    const { item, draw } = this.props

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
          <IntegerInput
            item={item}
            property="x"
            response={draw}
          />
          <IntegerInput
            item={item}
            property="y"
            response={draw}
          />
        </div>

        <label>Scale</label>
        <div style={{ display: 'flex' }}>
          <IntegerInput
            item={item}
            property="scale"
            response={draw}
          />
        </div>

        <label>Rotation</label>
        <div style={{ display: 'flex' }}>
          <IntegerInput
            item={item}
            property="rotation"
            response={draw}
          />
        </div>

        {this.classControls()}
      </div>
    )
  }
}

export default PropertyEditor
