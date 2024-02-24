import { observer } from 'mobx-react-lite'

import SelectionInput from '../../inputs/SelectionInput'
import Stage from '../../../store/Stage'
import { titleCase } from '../../../utility/string'

const mapValueToNiceString = (value) => (
  value.split('-').map((subValue) => titleCase(subValue)).join(' ')
)

const transparencyIndicatorOptions = Object.values(Stage.TRANSPARENT_INDICATORS).map(mapValueToNiceString)

const TransparencyIndicatorInput = observer(({ store, availableWidth }) => {
  const selectedValue = mapValueToNiceString(store.stage.transparentIndicator)

  return (
    <SelectionInput
      targetProperty={{
        value: {
          selected: selectedValue,
          values: transparencyIndicatorOptions,
        },
        label: 'transparency indicator',
        group: 'canvas',
      }}
      setPropertyValue={(newNiceString) => {
        const prevValue = store.stage.transparentIndicator
        const newValue = newNiceString.split(' ').join('-').toLowerCase()
        store.stage.setTransparencyIndicator(newValue)
        store.actionStack.push({
          revert: ['stage.setTransparencyIndicator', [prevValue]],
          perform: ['stage.setTransparencyIndicator', [newValue]],
        })
      }}
      availableWidth={availableWidth}
      disabled={!store.stage.transparent}
      noKeyframeGap
    />
  )
})

export default TransparencyIndicatorInput
