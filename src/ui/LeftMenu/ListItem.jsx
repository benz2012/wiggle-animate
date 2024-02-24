const ListItem = ({ id, name, icon, className, textHeight, paddingHeight, onClick }) => (
  <li
    id={`left-menu-item--${id}`}
    className={className}
    onPointerDown={onClick}
    onKeyDown={onClick}
    role="menuitem"
    style={{
      paddingTop: `${paddingHeight / 2}px`,
      paddingBottom: `${paddingHeight / 2}px`,
    }}
  >
    {icon}
    <span
      id={`left-menu-item-span--${id}`}
      className="noselect"
      style={{
        marginLeft: '8px',
        fontSize: `${textHeight}px`,
        lineHeight: `${textHeight}px`,
      }}
    >
      {name || '\u00A0'}
    </span>
  </li>
)

export default ListItem
