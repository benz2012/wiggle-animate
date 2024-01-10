import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import RedoIcon from '@mui/icons-material/Redo'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import UndoIcon from '@mui/icons-material/Undo'
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined'
import ClearIcon from '@mui/icons-material/Clear'

import MenuListItem from './MenuListItem'

// TODO [2]: Populate these actions

const EditMenu = ({ anchorEl, open, handleClose, store }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClick={handleClose}
    onClose={handleClose}
    slotProps={{ paper: { sx: { width: 220 } } }}
    MenuListProps={{ dense: true }}
  >
    <MenuListItem hotkey="⌘Z" IconClass={UndoIcon}>
      Undo
    </MenuListItem>
    <MenuListItem hotkey="⌘Y" IconClass={RedoIcon}>
      Redo
    </MenuListItem>
    <Divider />
    <MenuListItem hotkey="⌘X" IconClass={ContentCutIcon}>
      Cut
    </MenuListItem>
    <MenuListItem hotkey="⌘C" IconClass={ContentCopyIcon}>
      Copy
    </MenuListItem>
    <MenuListItem hotkey="⌘V" IconClass={ContentPasteIcon}>
      Paste
    </MenuListItem>
    <Divider />
    <MenuListItem hotkey="⌘A" IconClass={SelectAllIcon} onClick={() => store.build.selectAll()}>
      Select All
    </MenuListItem>
    <MenuListItem hotkey="⌘D" IconClass={ClearIcon} onClick={() => store.build.setSelected([])}>
      Deselect All
    </MenuListItem>
    <MenuListItem IconClass={DeleteOutlineIcon} HotkeyIcon={BackspaceOutlinedIcon}>
      Delete
    </MenuListItem>
  </Menu>
)

export default EditMenu
