/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Fragment } from 'react'

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

const LeftMenuActionBottom = ({ onClick, label }) => (
  <button
    type="button"
    className="noselect general-button left-menu-action-button"
    onClick={onClick}
  >
    {label}
  </button>
)

const ContainerListOfChildren = ({ store, container }) => (
  container.sortOrder.map((childId) => {
    const child = container.children[childId]
    const listItemClass = `left-menu-item ${store.build.selectedId === childId && 'left-menu-item-selected'}`
    return (
      <Fragment key={childId}>
        <li
          className={listItemClass}
          onClick={() => store.setSelected(childId)}
        >
          <span className="noselect" style={{ lineHeight: '14px', fontSize: '14px' }}>{child.name}</span>
        </li>
        <div style={{ marginLeft: 8 }}>
          {child instanceof Container && (
            <ContainerListOfChildren store={store} container={child} />
          )}
        </div>
      </Fragment>
    )
  })
)

const LeftMenu = ({ store, addRect, addContainer, decrementScale, incrementScale, resetView }) => (
  <div id="left-menu">
    <div style={{ display: 'flex' }}>
      <CreateItemButton onClick={addRect} label="+ rect" />
      <div style={{ marginLeft: 8 }} />
      <CreateItemButton onClick={addContainer} label="+ ctnr" />
    </div>
    <div style={{ flexGrow: 1 }}>
      <ContainerListOfChildren store={store} container={store.rootContainer} />
    </div>
    <div id="left-menu-action-bottom">
      <LeftMenuActionBottom label="-" onClick={decrementScale} />
      <span className="noselect percentage-text">
        {Math.trunc(store.rootContainer.canvasScale * 100)}%
      </span>
      <LeftMenuActionBottom label="+" onClick={incrementScale} />
      <LeftMenuActionBottom label="⟲" onClick={resetView} />
    </div>
  </div>
)

export default LeftMenu
