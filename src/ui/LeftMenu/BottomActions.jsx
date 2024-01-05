import BottomActionButton from './BottomActionButton'
import { scaleSteps } from '../../lib/structure/RootContainer'

const BottomActions = ({ store }) => (
  <div id="left-menu-action-bottom">
    <BottomActionButton
      label="-"
      onClick={() => store.rootContainer.decrementScale()}
      paddingBottom={3}
      disabled={store.rootContainer.canvasScale === scaleSteps[0]}
    />
    <span className="noselect percentage-text">
      {Math.trunc(store.rootContainer.canvasScale * 100)}%
    </span>
    <BottomActionButton
      label="+"
      onClick={() => store.rootContainer.incrementScale()}
      disabled={store.rootContainer.canvasScale === scaleSteps[scaleSteps.length - 1]}
    />
    <BottomActionButton
      label="⟲"
      onClick={() => store.view.reset()}
      paddingBottom={3}
      paddingRight={2}
    />
  </div>
)

export default BottomActions
