/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react'
import './TopMenu.css'

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
    icon = (<span style={{ fontSize: '14px', paddingBottom: '3px', paddingLeft: '2px' }}>⟳</span>)
  }
  if (saveStatus === 'error saving') { icon = '⚠' }
  if (saveStatus === 'unknown') { icon = '?' }

  return (
    <div id="top-menu">
      <button type="button" className="top-menu-item top-menu-item-button noselect">
        <span className="unicode-icon pb-3">⚙</span>
        Project
      </button>

      <button
        type="button"
        className="top-menu-item top-menu-item-button noselect"
      >
        <span className="unicode-icon" style={{ fontSize: '14px' }}>⌘</span>
        Hotkeys
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
                onClick={() => store.addContainer()}
              />
              <InsertMenuListItem
                icon={<div className="list-item-icon-rectangle" />}
                label="Rectangle"
                hotkeyIndicator="r"
                onClick={() => store.addRectangle()}
              />
              <InsertMenuListItem
                icon={<div className="list-item-icon-ellipse" />}
                label="Ellipse"
                hotkeyIndicator="e"
                onClick={() => store.addEllipse()}
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

      <button type="button" className="top-menu-item top-menu-item-button noselect">
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
