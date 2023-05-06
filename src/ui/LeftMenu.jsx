/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Fragment } from 'react'

import './LeftMenu.css'
import Container from '../structure/Container'

const CreateItemButton = ({ onClick, label }) => (
  <button
    type="button"
    className="noselect general-button left-menu-action-button mb-8"
    style={{ flexGrow: 1 }}
    onClick={onClick}
  >
    {label}
  </button>
)

const LeftMenuActionBottom = ({ onClick, label, paddingBottom, paddingRight }) => (
  <button
    type="button"
    className="noselect general-button left-menu-action-button"
    onClick={onClick}
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
        } else {
          // console.log('hallow')
        }
      } else {
        store.setSelected([clickedId])
      }
    } else {
      store.setSelected([clickedId])
    }
  }

  return (
    container.sortOrder.map((childId) => {
      const child = container.children[childId]
      const listItemClass = `left-menu-item ${store.build.selectedIds.includes(childId) && 'left-menu-item-selected'}`
      return (
        <Fragment key={childId}>
          <li
            className={listItemClass}
            onClick={handleItemClick(childId)}
          >
            <span className="noselect" style={{ lineHeight: '14px', fontSize: '14px' }}>{child.name}</span>
          </li>
          <div style={{ marginLeft: 8 }}>
            {child instanceof Container && (
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
  <div id="left-menu-container">
    <div id="left-menu">
      <div style={{ display: 'flex' }}>
        <CreateItemButton onClick={() => store.addRect()} label="+ rect" />
        <div style={{ marginLeft: 8 }} />
        <CreateItemButton onClick={() => store.addContainer()} label="+ ctnr" />
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
        />
        <span className="noselect percentage-text">
          {Math.trunc(store.rootContainer.canvasScale * 100)}%
        </span>
        <LeftMenuActionBottom label="+" onClick={incrementScale} />
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
