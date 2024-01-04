/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Fragment } from 'react'
import { action } from 'mobx'

import './LeftMenu.css'
import Container from '../lib/structure/Container'
import { scaleSteps } from '../lib/structure/RootContainer'

const LeftMenuActionBottom = ({ onClick, label, paddingBottom, paddingRight, disabled }) => (
  <button
    type="button"
    className="noselect left-menu-action-button"
    onClick={onClick}
    disabled={disabled}
  >
    <span style={{ paddingBottom, paddingRight }}>{label}</span>
  </button>
)

const ContainerListOfChildren = (props) => {
  const { store, container } = props

  const handleItemClick = (clickedId) => () => {
    const { selectedIds } = store.build
    if (store.keyHeld.Meta) {
      if (selectedIds.includes(clickedId)) {
        store.build.removeFromSelection(clickedId)
      } else {
        store.build.addToSelection(clickedId)
      }
    } else if (store.keyHeld.Shift && selectedIds.length > 0) {
      const parent = store.rootContainer.findParent(clickedId)
      const preselectedSiblings = parent.sortOrder
        .filter((siblingId) => selectedIds.includes(siblingId))
      if (preselectedSiblings.length > 0) {
        // sort siblings and then find lowest and hightest, compare to where we are clicking
        const indexOfClickedChild = parent.sortOrder.findIndex((childId) => childId === clickedId)
        const indexOfFirstSelectedSibling = parent.sortOrder.findIndex((childId) => (
          childId === preselectedSiblings[0]
        ))
        const indexOflastSelectedSibling = parent.sortOrder.findIndex((childId) => (
          childId === preselectedSiblings[preselectedSiblings.length - 1]
        ))

        if (indexOfClickedChild < indexOflastSelectedSibling) {
          // select upwards from last
          const childrenBetweenClickAndLast = parent.sortOrder.slice(
            indexOfClickedChild,
            indexOflastSelectedSibling + 1,
          )
          store.build.setSelected(childrenBetweenClickAndLast)
        } else if (indexOfClickedChild > indexOfFirstSelectedSibling) {
          // select downwards from first
          const childrenBetweenFirstAndClick = parent.sortOrder.slice(
            indexOfFirstSelectedSibling,
            indexOfClickedChild + 1,
          )
          store.build.setSelected(childrenBetweenFirstAndClick)
        }
      } else {
        store.build.setSelected([clickedId])
      }
    } else {
      store.build.setSelected([clickedId])
    }
  }

  const handleDropdownClick = (child) => action(() => {
    child.showChildren = !child.showChildren
  })

  // TODO [4]: Replace name prop field with double-click-to-edit in left menu
  //       item name can be a whitespace character. eliminate this
  //       and also trim whitespace on head and tail during naming /[^\s]/

  return (
    container.sortOrder.map((childId) => {
      const child = container.children[childId]
      const isContainer = child instanceof Container

      let listItemClass = 'left-menu-item'
      if (store.build.selectedIds.includes(childId)) {
        listItemClass += ' left-menu-item-selected'
      }
      if (isContainer) {
        listItemClass += ' left-menu-item-container'
      }
      if (store.build.hoveredId === childId) {
        listItemClass += ' left-menu-item-hovered'
      }

      return (
        <Fragment key={childId}>
          {isContainer ? (
            <li
              id={`left-menu-item--${child.id}`}
              className={listItemClass}
            >
              <div className="noselect left-menu-container-dropwdown" onClick={handleDropdownClick(child)}>
                <div className={`left-menu-container-dropwdown-text ${child.showChildren ? 'open' : 'closed'}`}>
                  {'>'}
                </div>
              </div>
              <div
                id={`left-menu-item-div--${child.id}`}
                className="noselect left-menu-item-name left-menu-item-container-name"
                onClick={handleItemClick(childId)}
              >
                {child.name}
              </div>
            </li>
          ) : (
            <li
              id={`left-menu-item--${child.id}`}
              className={listItemClass}
              onClick={handleItemClick(childId)}
            >
              <span
                id={`left-menu-item-span--${child.id}`}
                className="noselect left-menu-item-name"
              >
                {child.name || '\u00A0'}
              </span>
            </li>
          )}
          <div style={{ marginLeft: 12 }}>
            {(isContainer && child.showChildren) && (
              <ContainerListOfChildren {...props} container={child} />
            )}
          </div>
        </Fragment>
      )
    })
  )
}

const LeftMenu = ({
  store,
  decrementScale,
  incrementScale,
}) => (
  <div id="left-menu-container" tabIndex="0">
    <div id="left-menu">
      <div id="left-menu-header">
        Layers
      </div>

      <div style={{ flexGrow: 1 }}>
        <ContainerListOfChildren
          store={store}
          container={store.rootContainer}
        />
      </div>

      <div id="left-menu-action-bottom">
        <LeftMenuActionBottom
          label="-"
          onClick={decrementScale}
          paddingBottom={3}
          disabled={store.rootContainer.canvasScale === scaleSteps[0]}
        />
        <span className="noselect percentage-text">
          {Math.trunc(store.rootContainer.canvasScale * 100)}%
        </span>
        <LeftMenuActionBottom
          label="+"
          onClick={incrementScale}
          disabled={store.rootContainer.canvasScale === scaleSteps[scaleSteps.length - 1]}
        />
        <LeftMenuActionBottom
          label="⟲"
          onClick={() => store.view.reset()}
          paddingBottom={3}
          paddingRight={2}
        />
      </div>
    </div>
  </div>
)

export default LeftMenu
