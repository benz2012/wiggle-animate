import { observer } from 'mobx-react-lite'

import SelectionInput from '../inputs/SelectionInput'
import Animation from '../../lib/animation/Animation'

const frameRateOptions = Animation.RATES.map((rate) => rate.toFixed(2))

const AnimationRateInput = observer(({ store, availableWidth }) => (
  <SelectionInput
    targetProperty={{
      value: {
        selected: store.animation.fps.toFixed(2),
        values: frameRateOptions,
      },
      label: 'frame rate',
      group: 'animation',
    }}
    setPropertyValue={(newValue) => store.animation.setRate(parseFloat(newValue))}
    availableWidth={availableWidth / 2}
  />
))

export default AnimationRateInput
