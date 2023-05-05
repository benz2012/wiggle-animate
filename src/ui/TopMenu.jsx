import './TopMenu.css'

const TopMenu = ({ projectName, saveStatus }) => {
  // default case is 'autosaved'

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
      <button type="button" className="top-menu-item top-menu-item-button">
        <span className="unicode-icon pb-3">⚙</span>
        Project
      </button>

      <button type="button" className="top-menu-item top-menu-item-button">
        <span className="unicode-icon" style={{ fontSize: '14px' }}>⌘</span>
        Hotkeys
      </button>

      <button type="button" className="top-menu-item top-menu-item-button">
        <span className="unicode-icon">+</span>
        Insert
      </button>

      <div style={{ flexGrow: 1 }} />

      <div className="top-menu-item" style={{ marginRight: 0, paddingRight: 0 }}>
        ✎ {projectName || 'Unnamed Project'}
      </div>

      <div className="top-menu-item">
        <span className="autosave-text"><em>{saveStatus}</em></span>
        <div className={iconClass}>
          {icon}
        </div>
      </div>

      <div style={{ flexGrow: 1 }} />

      <button type="button" className="top-menu-item top-menu-item-button">
        <span className="unicode-icon">↯</span>
        Export
      </button>
    </div>
  )
}

export default TopMenu
