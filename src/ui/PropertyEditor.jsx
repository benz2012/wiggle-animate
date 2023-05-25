import { action } from 'mobx'
import { observer } from 'mobx-react-lite'

import './PropertyEditor.css'
import Vector2 from '../lib/structure/Vector2'
import Angle from '../lib/structure/Angle'

const PropertyEditor = observer(({ store }) => {
  const { build, rootContainer } = store
  // const { propertyEditor } = store

  // eslint-disable-next-line no-unused-vars
  const placeholdFunc1 = () => {
    const { selectedIds } = build

    // TODO: support multi-selected property edit case
    if (selectedIds.length === 0) {
      return 'Select an Item'
    }
    if (selectedIds.length > 1) {
      return 'Select only 1'
    }
    const selectedItem = rootContainer.findItem(selectedIds[0])

    const schema = Object.fromEntries(
      selectedItem.editables.map((entry) => {
        const [prop, propType] = entry

        let value = selectedItem[prop]
        let extras = {}
        switch (propType) {
          case 'string':
            break
          case 'number':
            break
          case 'Vector2':
            value = selectedItem[prop].object
            break
          case 'Angle':
            value = selectedItem[prop].degrees
            extras = {
              min: 0,
              max: 360,
              step: 1,
            }
            break
          default:
            break
        }

        return ([`${selectedItem.id}--${prop}`, {
          label: prop,
          type: propType,
          value,
          onChange: action((newValue) => {
            let newValueToSet = newValue
            if (propType === 'Vector2') {
              newValueToSet = new Vector2(...Object.values(newValue))
            } else if (propType === 'Angle') {
              newValueToSet = new Angle(newValue)
            }
            selectedItem[prop] = newValueToSet
          }),
          ...extras,
        }])
      })
    )

    return schema
  }

  return (
    <div
      id="property-editor-container"
      style={{
        top: store.propertyEditor.position.y,
        right: store.propertyEditor.position.x,
      }}
    >
      Property Editor Placeholder
    </div>
  )
})

export default PropertyEditor
