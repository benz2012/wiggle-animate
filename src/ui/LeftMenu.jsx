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
        store.removeFromSelection(clickedId)
      } else {
        store.addToSelection(clickedId)
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
          store.setSelected(childrenBetweenClickAndLast)
        } else if (indexOfClickedChild > indexOfFirstSelectedSibling) {
          // select downwards from first
          const childrenBetweenFirstAndClick = parent.sortOrder.slice(
            indexOfFirstSelectedSibling,
            indexOfClickedChild + 1,
          )
          store.setSelected(childrenBetweenFirstAndClick)
        }
      } else {
        store.setSelected([clickedId])
      }
    } else {
      store.setSelected([clickedId])
    }
  }

  const handleDropdownClick = (child) => action(() => {
    child.showChildren = !child.showChildren
  })

  // TODO: When hovering over item in left menu, show hover outline on canvas as well

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

      return (
        <Fragment key={childId}>
          {isContainer ? (
            <li className={listItemClass}>
              <div className="noselect left-menu-container-dropwdown" onClick={handleDropdownClick(child)}>
                <div className={`left-menu-container-dropwdown-text ${child.showChildren ? 'open' : 'closed'}`}>
                  {'>'}
                </div>
              </div>
              <div
                className="noselect left-menu-item-name left-menu-item-container-name"
                onClick={handleItemClick(childId)}
              >
                {child.name}
              </div>
            </li>
          ) : (
            <li className={listItemClass} onClick={handleItemClick(childId)}>
              <span className="noselect left-menu-item-name">{child.name}</span>
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
        Layers <button onClick={store.populate}>populate</button>
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
          onClick={() => store.resetView()}
          paddingBottom={3}
          paddingRight={2}
        />
      </div>
    </div>
  </div>
)

export default LeftMenu
