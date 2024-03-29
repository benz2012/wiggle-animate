/* eslint-disable jsx-a11y/interactive-supports-focus */
import { observer } from 'mobx-react-lite'

const ListItemAsContainer = observer(({
  id,
  name,
  className,
  textHeight,
  paddingHeight,
  onClick,
  showDropdown,
  onDropdownClick,
}) => (
  <li
    id={`left-menu-item--${id}`}
    className={className}
  >
    <div
      className={`
        noselect
        left-menu-container-dropwdown
        ${className.includes('-selected') ? 'left-menu-container-dropwdown-selected' : ''}
      `}
      onClick={onDropdownClick}
      onKeyUp={onDropdownClick}
      role="button"
    >
      <div className={`left-menu-container-dropwdown-text ${showDropdown ? 'open' : 'closed'}`}>
        {'>'}
      </div>
    </div>
    <div
      id={`left-menu-item-div--${id}`}
      className="noselect left-menu-item-container-name"
      onPointerDown={onClick}
      onKeyDown={onClick}
      role="menuitem"
      style={{
        fontSize: `${textHeight}px`,
        lineHeight: `${textHeight}px`,
        paddingTop: `${paddingHeight / 2}px`,
        paddingBottom: `${paddingHeight / 2}px`,
      }}
    >
      {name || '\u00A0'}
    </div>
  </li>
))

export default ListItemAsContainer
