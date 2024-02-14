// TODO [2]: add the item icon to the left of the item, instead of using the name prefix (or maybe try both)

const ListItem = ({ id, name, className, textHeight, paddingHeight, onClick }) => (
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
    <span
      id={`left-menu-item-span--${id}`}
      className="noselect"
      style={{
        fontSize: `${textHeight}px`,
        lineHeight: `${textHeight}px`,
      }}
    >
      {name || '\u00A0'}
    </span>
  </li>
)

export default ListItem
