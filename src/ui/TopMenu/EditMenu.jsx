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
import { getBrowserModifierKey } from '../../utility/string'

const BMK = getBrowserModifierKey()

const EditMenu = ({ anchorEl, open, handleClose, store }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClick={handleClose}
    onClose={handleClose}
    slotProps={{ paper: { sx: { width: 220 } } }}
    MenuListProps={{ dense: true }}
  >
    <MenuListItem
      hotkey="Z"
      hotkeyModifiers={[BMK]}
      IconClass={UndoIcon}
      disabled={!store.actionStack.canUndo}
      onClick={() => store.actionStack.undo()}
    >
      Undo
    </MenuListItem>
    <MenuListItem
      hotkey="Y"
      hotkeyModifiers={[BMK]}
      IconClass={RedoIcon}
      disabled={!store.actionStack.canRedo}
      onClick={() => store.actionStack.redo()}
    >
      Redo
    </MenuListItem>
    <Divider />
    <MenuListItem
      hotkey="X"
      hotkeyModifiers={[BMK]}
      IconClass={ContentCutIcon}
      onClick={() => store.build.copySelectionToClipboard(true)}
    >
      Cut
    </MenuListItem>
    <MenuListItem
      hotkey="C"
      hotkeyModifiers={[BMK]}
      IconClass={ContentCopyIcon}
      onClick={() => store.build.copySelectionToClipboard()}
    >
      Copy
    </MenuListItem>
    <MenuListItem
      hotkey="V"
      hotkeyModifiers={[BMK]}
      IconClass={ContentPasteIcon}
      onClick={() => store.build.pasteWithAButton()}
    >
      Paste
    </MenuListItem>
    <Divider />
    <MenuListItem
      hotkey="A"
      hotkeyModifiers={[BMK]}
      IconClass={SelectAllIcon}
      onClick={() => store.build.selectAll()}
    >
      Select All
    </MenuListItem>
    <MenuListItem
      hotkey="D"
      hotkeyModifiers={[BMK]}
      IconClass={ClearIcon}
      onClick={() => store.build.setSelected([])}
    >
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
