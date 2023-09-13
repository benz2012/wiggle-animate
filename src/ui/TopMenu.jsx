/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react'

import './TopMenu.css'
import bCurveIcon from '../assets/b-curve-icon.png'

const InsertMenuListItem = ({ icon, label, hotkeyIndicator, onClick }) => (
  <div className="insert-menu-list-item" onClick={onClick}>
    <div className="insert-menu-list-item-icon">{icon}</div>
    <div className="insert-menu-list-item-label">{label}</div>
    <div className="insert-menu-list-item-hotkey">{hotkeyIndicator}</div>
  </div>
)

const TopMenu = ({ store }) => {
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const { saveStatus } = store.project

  let iconClass = 'autosave-icon'
  if (saveStatus === 'saving') { iconClass = 'autosave-icon icon-bg-grey icon-spin' }
  if (saveStatus === 'error saving') { iconClass = 'autosave-icon icon-bg-warning' }
  if (saveStatus === 'unknown') { iconClass = 'autosave-icon icon-bg-grey' }

  let icon = '✓'
  if (saveStatus === 'saving') {
    icon = (<span className="autosave-icon-wheel">⟳</span>)
  }
  if (saveStatus === 'error saving') { icon = '⚠' }
  if (saveStatus === 'unknown') { icon = '?' }

  const handleInsertActionWith = (func) => () => {
    func()
    document.getElementById('stage').focus()
  }

  return (
    <div id="top-menu">
      <button type="button" className="top-menu-item top-menu-item-button noselect">
        <span className="unicode-icon pb-3">⚙</span>
        Settings
      </button>

      <button
        type="button"
        className="top-menu-item top-menu-item-button noselect"
      >
        <span className="unicode-icon font-14">⌘</span>
        Edit
        {/* This menu can have like undo/redo */}
      </button>

      <button
        type="button"
        className="top-menu-item top-menu-item-button noselect"
        // my hacky backdrop thing is messing click up, also sucks on mobile
        // replace this with better menu/diaglog components in the future
        onClick={() => setInsertMenuOpen(!insertMenuOpen)}
        onPointerEnter={() => setInsertMenuOpen(true)}
        onPointerLeave={() => setInsertMenuOpen(false)}
        style={{ position: 'relative' }}
      >
        <span className="unicode-icon">+</span>
        Insert
        {insertMenuOpen && (
          <>
            <div className="dialog-menu">
              <InsertMenuListItem
                icon={<div className="list-item-icon-container" />}
                label="Container"
                hotkeyIndicator="c"
                onClick={handleInsertActionWith(() => store.addContainer())}
              />
              <InsertMenuListItem
                icon={<div className="list-item-icon-rectangle" />}
                label="Rectangle"
                hotkeyIndicator="r"
                onClick={handleInsertActionWith(() => store.addRectangle())}
              />
              <InsertMenuListItem
                icon={<div className="list-item-icon-ellipse" />}
                label="Ellipse"
                hotkeyIndicator="e"
                onClick={handleInsertActionWith(() => store.addEllipse())}
              />
              <InsertMenuListItem
                icon={<div className="list-item-icon-polygon" />}
                label="Polygon"
                hotkeyIndicator="y"
                onClick={handleInsertActionWith(() => store.addPolygon())}
              />
              <InsertMenuListItem
                icon={<div className="list-item-icon-text" />}
                label="Text"
                hotkeyIndicator="t"
                onClick={handleInsertActionWith(() => store.addText())}
              />
              <InsertMenuListItem
                icon={<div className="list-item-icon-line" />}
                label="Line"
                hotkeyIndicator="l"
                onClick={handleInsertActionWith(() => store.addLine())}
              />
              <InsertMenuListItem
                captureClickId="insert-menu-start-path-tool"
                icon={(
                  <img
                    alt="bezier-curve-icon"
                    src={bCurveIcon}
                    className="list-item-icon-path"
                  />
                )}
                label="Path"
                hotkeyIndicator="p"
                onClick={handleInsertActionWith(() => store.setTool(store.tools.PATH))}
              />
            </div>
            <div className="dialog-backdrop" />
          </>
        )}
      </button>

      <div style={{ flexGrow: 1 }} />

      <div className="top-menu-item noselect" style={{ marginRight: 0, paddingRight: 0 }}>
        ✎ {store.project.name || 'Unnamed Project'}
      </div>

      <div className="top-menu-item noselect">
        <span className="autosave-text"><em>{saveStatus}</em></span>
        <div className={iconClass}>
          {icon}
        </div>
      </div>

      <div style={{ flexGrow: 1 }} />

      <button
        type="button"
        className="top-menu-item top-menu-item-button noselect"
        onClick={store.export}
      >
        <span className="unicode-icon">↯</span>
        Export
      </button>

      <button type="button" className="top-menu-item top-menu-item-button noselect">
        ?
      </button>
    </div>
  )
}

export default TopMenu
