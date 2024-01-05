/* eslint-disable jsx-a11y/interactive-supports-focus */

const ListItemAsContainer = ({
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
      className="noselect left-menu-container-dropwdown"
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
      onClick={onClick}
      onKeyUp={onClick}
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
)

export default ListItemAsContainer
