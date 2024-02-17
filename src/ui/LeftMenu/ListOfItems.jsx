import { Fragment } from 'react'
import { observer } from 'mobx-react-lite'

import Container from '../../lib/structure/Container'
import ListItem from './ListItem'
import ListItemAsContainer from './ListItemAsContainer'
import generateItemClickHandler from './generateItemClickHandler'
import TinyIcon from './TinyIcon'
import theme from '../theme'

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
    if (store.leftMenu.containerToOpen === childId) {
      listItemClass += ' left-menu-item-container-hovered'
    }
    return listItemClass
  }

  return (
    parentContainer.sortOrder.map((itemId) => {
      const item = parentContainer.children[itemId]
      const isContainer = item instanceof Container

      if (isContainer) {
        let containerLineColor = theme.palette.action.disabled
        if (store.build.selectedIds.includes(itemId)) {
          containerLineColor = theme.palette.action.selected
        }
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
              <div
                style={{
                  marginLeft: '6.5px',
                  borderLeft: `1px solid ${containerLineColor}`,
                  paddingLeft: '4.5px',
                }}
              >
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
            icon={<TinyIcon itemClass={item.constructor.className} />}
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
