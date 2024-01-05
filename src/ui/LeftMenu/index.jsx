import './LeftMenu.css'
import BottomActions from './BottomActions'
import ListOfItems from './ListOfItems'
import DraggingIndicators from './DraggingIndicators'

const LeftMenu = ({ store }) => (
  <div id="left-menu-container" tabIndex="-1">
    <div id="left-menu">
      <div id="left-menu-header" className="noselect">Layers</div>

      <div style={{ flexGrow: 1 }}>
        <ListOfItems store={store} parentContainer={store.rootContainer} />
      </div>

      <BottomActions store={store} />

      {store.leftMenu.dragStart && <DraggingIndicators store={store} />}
    </div>
  </div>
)

export default LeftMenu
