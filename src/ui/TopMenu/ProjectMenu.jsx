import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import AutoModeIcon from '@mui/icons-material/AutoMode'
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'
import DrawIcon from '@mui/icons-material/Draw'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import OfflinePinIcon from '@mui/icons-material/OfflinePin'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import SaveIcon from '@mui/icons-material/Save'
import TuneIcon from '@mui/icons-material/Tune'
import TypeSpecimenIcon from '@mui/icons-material/TypeSpecimen'

import MenuListItem from './MenuListItem'

const size20 = { width: '20px', height: '20px' }

const ProjectMenu = observer(({ anchorEl, open, handleClose, store }) => {
  const inputProjectFileRef = useRef()

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClick={handleClose}
        onClose={handleClose}
        slotProps={{ paper: { sx: { width: 240 } } }}
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
          disabled={store.storage.autosaveToBrowser}
          onClick={() => {
            inputProjectFileRef.current.click()
          }}
        >
          Open
        </MenuListItem>
        <MenuListItem
          IconClass={CancelPresentationIcon}
          hotkey="⌘W"
          disabled={store.storage.autosaveToBrowser}
          onClick={() => store.project.reInitializeAll()}
        >
          Close & New
        </MenuListItem>
        <MenuListItem
          IconClass={FileCopyIcon}
          disabled={store.storage.autosaveToBrowser}
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
          hotkey={(
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {store.storage.autosaveToBrowser ? (
                <OfflinePinIcon color="success" sx={{ ...size20 }} />
              ) : (
                <HighlightOffIcon sx={{ ...size20 }} />
              )}
            </Box>
          )}
          onClick={(event) => {
            event.stopPropagation()
            store.storage.setAutosaveToBrowser(!store.storage.autosaveToBrowser)
          }}
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
})

export default ProjectMenu
