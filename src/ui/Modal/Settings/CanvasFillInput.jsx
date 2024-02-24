import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'

import GenericInputWithInternalValue from '../../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../../inputs/util'
import { generateDebouncedSetterAndSubmitter } from '../../../utility/state'
import { voidFunc } from '../../../utility/object'

const CanvasFillInput = observer(({ store, availableWidth }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setterAndSubmitter = useCallback(generateDebouncedSetterAndSubmitter(
    store.actionStack,
    'rootContainer.setCanvasFill',
    () => store.rootContainer.canvasFill,
    (newValue) => store.rootContainer.setCanvasFill(newValue),
  ), [])

  return (
    <GenericInputWithInternalValue
      label="fill color"
      availableWidth={availableWidth}
      propertyValue={store.rootContainer.canvasFill}
      // We aren't allowing alpha editing at this time, but this is needed to prevent the
      // colorpicker component from entering an infinite render loop
      secondaryValue={100}
      subProperties={['red', 'green', 'blue']}
      setPropertyValue={setterAndSubmitter}
      setSecondaryPropertyValue={voidFunc}
      parseAndValidateNewValue={parseAndValidateInteger}
      disabled={store.stage.transparent}
      isColor
      excludeAlpha
      addDragBox
      noKeyframeGap
    />
  )
})

export default CanvasFillInput
