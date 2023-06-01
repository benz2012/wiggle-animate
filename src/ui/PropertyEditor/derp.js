import Vector2 from '../../lib/structure/Vector2'
import Angle from '../../lib/structure/Angle'

const placeholdFunc1 = () => {
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
}
