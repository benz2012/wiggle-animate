import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'

import './LeftMenu.css'
import BottomActions from './BottomActions'
import ListOfItems from './ListOfItems'
import DraggingIndicators from './DraggingIndicators'

// TODO [4]: Allow user to sort item Outside-of but right below a Container
//           this will likely require having two hover regions, one for inside (to the upper-right)
//           and one for outside (to the lower-left)

// TODO [4]: Add auto-scrolling when someone is dragging a list item and they
//           move their mouse near the top or the bottom of the list

// TODO [4]: Add Layer Lock & Button Icon in menu

// TODO [4]: Add Layer Visible & Button Icon in menu

// TODO [4]: Add arrow on header that allows show/hide of left menu

// TODO [4]: use material icons on left menu action buttons

const LeftMenu = observer(({ store, windowHeight }) => {
  const listContainerRef = useRef()

  useEffect(() => {
    if (!listContainerRef.current) return
    const { top, bottom, right } = listContainerRef.current.getBoundingClientRect()
    store.leftMenu.setListPosition(top, bottom, right)
  }, [store.leftMenu, windowHeight])

  return (
    <div id="left-menu-container" tabIndex="-1">
      <div id="left-menu">
        <div id="left-menu-header" className="noselect">Layers</div>

        <div
          ref={listContainerRef}
          id="left-menu-list-container"
          onScroll={store.leftMenu.handleListScroll}
        >
          <ListOfItems store={store} parentContainer={store.rootContainer} />
        </div>

        <BottomActions store={store} />

        {store.leftMenu.dragStart && <DraggingIndicators store={store} />}
      </div>
    </div>
  )
})

export default LeftMenu
