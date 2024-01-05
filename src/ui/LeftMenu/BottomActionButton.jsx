const BottomActionButton = ({ onClick, label, paddingBottom, paddingRight, disabled }) => (
  <button
    type="button"
    className="noselect left-menu-action-button"
    onClick={onClick}
    disabled={disabled}
  >
    <span style={{ paddingBottom, paddingRight }}>{label}</span>
  </button>
)

export default BottomActionButton
