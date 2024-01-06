import { Fragment } from 'react'
import { observer } from 'mobx-react-lite'

import Container from '../../lib/structure/Container'
import ListItem from './ListItem'
import ListItemAsContainer from './ListItemAsContainer'
import generateItemClickHandler from './generateItemClickHandler'

// TODO [4]: Replace name prop field with double-click-to-edit in left menu
//       item name can be a whitespace character. eliminate this
//       and also trim whitespace on head and tail during naming /[^\s]/

const ListOfItems = observer(({ store, parentContainer }) => {
  const paddingHeight = store.leftMenu.itemHeight - store.leftMenu.itemTextHeight

  const determineStyles = (childId, isContainer) => {
    let listItemClass = 'left-menu-item'
    if (store.build.selectedIds.includes(childId)) {
      listItemClass += ' left-menu-item-selected'
    }
    if (store.build.hoveredId === childId) {
      listItemClass += ' left-menu-item-hovered'
    }
    if (isContainer) {
      listItemClass += ' left-menu-item-container'
    }
    return listItemClass
  }

  return (
    parentContainer.sortOrder.map((itemId) => {
      const item = parentContainer.children[itemId]
      const isContainer = item instanceof Container

      if (isContainer) {
        return (
          <Fragment key={itemId}>
            <ListItemAsContainer
              id={item.id}
              name={item.name}
              className={determineStyles(itemId, true)}
              textHeight={store.leftMenu.itemTextHeight}
              paddingHeight={paddingHeight}
              onClick={generateItemClickHandler(store, itemId)}
              showDropdown={item.showChildren}
              onDropdownClick={item.toggleShowChildren}
            />
            {/* Render it's children, recursivley */}
            {item.showChildren && (
              <div style={{ marginLeft: 12 }}>
                <ListOfItems store={store} parentContainer={item} />
              </div>
            )}
          </Fragment>
        )
      }

      return (
        <Fragment key={itemId}>
          <ListItem
            id={item.id}
            name={item.name}
            className={determineStyles(itemId, false)}
            textHeight={store.leftMenu.itemTextHeight}
            paddingHeight={paddingHeight}
            onClick={generateItemClickHandler(store, itemId)}
          />
        </Fragment>
      )
    })
  )
})

export default ListOfItems
