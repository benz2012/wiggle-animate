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
    <MenuListItem hotkey="⌘X" IconClass={ContentCutIcon} onClick={() => store.build.copySelectionToClipboard(true)}>
      Cut
    </MenuListItem>
    <MenuListItem hotkey="⌘C" IconClass={ContentCopyIcon} onClick={() => store.build.copySelectionToClipboard()}>
      Copy
    </MenuListItem>
    <MenuListItem hotkey="⌘V" IconClass={ContentPasteIcon} onClick={() => store.build.pasteWithAButton()}>
      Paste
    </MenuListItem>
    <Divider />
    <MenuListItem hotkey="⌘A" IconClass={SelectAllIcon} onClick={() => store.build.selectAll()}>
      Select All
    </MenuListItem>
    <MenuListItem hotkey="⌘D" IconClass={ClearIcon} onClick={() => store.build.setSelected([])}>
      Deselect All
    </MenuListItem>
    <MenuListItem
      IconClass={DeleteOutlineIcon}
      HotkeyIcon={BackspaceOutlinedIcon}
      onClick={() => store.build.deleteAllSelected()}
    >
      Delete
    </MenuListItem>
  </Menu>
)

export default EditMenu
