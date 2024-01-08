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

import MenuListItem from './MenuListItem'

// TODO [2]: Populate these actions

const EditMenu = ({ anchorEl, open, handleClose }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={handleClose}
    slotProps={{ paper: { sx: { width: 220 } } }}
    MenuListProps={{ dense: true }}
  >
    <MenuListItem hotkey="Z" IconClass={UndoIcon}>
      Undo
    </MenuListItem>
    <MenuListItem hotkey="Y" IconClass={RedoIcon}>
      Redo
    </MenuListItem>
    <Divider />
    <MenuListItem hotkey="X" IconClass={ContentCutIcon}>
      Cut
    </MenuListItem>
    <MenuListItem hotkey="C" IconClass={ContentCopyIcon}>
      Copy
    </MenuListItem>
    <MenuListItem hotkey="V" IconClass={ContentPasteIcon}>
      Paste
    </MenuListItem>
    <Divider />
    <MenuListItem hotkey="A" IconClass={SelectAllIcon}>
      Select All
    </MenuListItem>
    <MenuListItem IconClass={DeleteOutlineIcon} HotkeyIcon={BackspaceOutlinedIcon}>
      Delete
    </MenuListItem>
  </Menu>
)

export default EditMenu
