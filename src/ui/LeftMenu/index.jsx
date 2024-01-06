import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'

import './LeftMenu.css'
import BottomActions from './BottomActions'
import ListOfItems from './ListOfItems'
import DraggingIndicators from './DraggingIndicators'

// TODO [2]: Add dragging/re-sorting of multiple selection

// TODO [2]: when hovering over a container for a while, open it, so user can drag into it

// TODO [4]: Add auto-scrolling when someone is dragging a list item and they
//           move their mouse near the top or the bottom of the list

const LeftMenu = observer(({ store, windowHeight }) => {
  const listContainerRef = useRef()

  useEffect(() => {
    if (!listContainerRef.current) return
    const { top, bottom } = listContainerRef.current.getBoundingClientRect()
    store.leftMenu.setListPosition(top, bottom)
  }, [store.leftMenu, windowHeight])

  return (
    <div id="left-menu-container" tabIndex="-1">
      <div id="left-menu">
        <div id="left-menu-header" className="noselect">Layers</div>

        <div ref={listContainerRef} id="left-menu-list-container">
          <ListOfItems store={store} parentContainer={store.rootContainer} />
        </div>

        <BottomActions store={store} />

        {store.leftMenu.dragStart && <DraggingIndicators store={store} />}
      </div>
    </div>
  )
})

export default LeftMenu
