import { useRef } from 'react'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'

import AutoModeIcon from '@mui/icons-material/AutoMode'
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'
import DrawIcon from '@mui/icons-material/Draw'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import SaveIcon from '@mui/icons-material/Save'
import TypeSpecimenIcon from '@mui/icons-material/TypeSpecimen'
import TuneIcon from '@mui/icons-material/Tune'

import MenuListItem from './MenuListItem'

const ProjectMenu = ({ anchorEl, open, handleClose, store }) => {
  const inputProjectFileRef = useRef()

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClick={handleClose}
        onClose={handleClose}
        slotProps={{ paper: { sx: { width: 220 } } }}
        MenuListProps={{ dense: true }}
      >
        <MenuListItem
          IconClass={TuneIcon}
          hotkey="⌘,"
          onClick={() => null}
        >
          Settings
        </MenuListItem>
        <MenuListItem
          IconClass={DriveFileRenameOutlineIcon}
          onClick={() => null}
        >
          Rename
        </MenuListItem>
        <MenuListItem
          IconClass={TypeSpecimenIcon}
          onClick={() => store.view.openDialog('addFonts')}
        >
          Add Fonts
        </MenuListItem>
        <Divider />
        <MenuListItem
          IconClass={FileOpenIcon}
          hotkey="⌘O"
          onClick={() => {
            inputProjectFileRef.current.click()
          }}
        >
          Open
        </MenuListItem>
        <MenuListItem
          IconClass={CancelPresentationIcon}
          hotkey="⌘W"
          onClick={() => null}
        >
          Close
        </MenuListItem>
        <MenuListItem
          IconClass={DrawIcon}
          hotkey="⌘N"
          onClick={() => null}
        >
          New
        </MenuListItem>
        <MenuListItem
          IconClass={FileCopyIcon}
          onClick={() => null}
        >
          Duplicate
        </MenuListItem>
        <Divider />
        <MenuListItem
          IconClass={SaveIcon}
          hotkey="⌘S"
          onClick={() => store.project.save()}
        >
          Save
        </MenuListItem>
        <MenuListItem
          IconClass={SaveAsIcon}
          onClick={() => null}
        >
          Save As
        </MenuListItem>
        <MenuListItem
          IconClass={AutoModeIcon}
          onClick={() => null}
        >
          Autosave to browser
        </MenuListItem>
      </Menu>

      <input
        ref={inputProjectFileRef}
        type="file"
        id="input-project-file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(event) => {
          const chosenFile = event.target.files[0]
          store.project.load(chosenFile)
        }}
      />
    </>
  )
}

export default ProjectMenu
