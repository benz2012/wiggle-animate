import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import AutoModeIcon from '@mui/icons-material/AutoMode'
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import OfflinePinIcon from '@mui/icons-material/OfflinePin'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import TuneIcon from '@mui/icons-material/Tune'
import TypeSpecimenIcon from '@mui/icons-material/TypeSpecimen'

import MenuListItem from './MenuListItem'
import { getBrowserModifierKey } from '../../utility/string'

const BMK = getBrowserModifierKey()
const size20 = { width: '20px', height: '20px' }

// TODO [3]: Settings Ideas
//  - When selecting item on the stage, force open the containers in tree view, default: true

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
          hotkey=","
          hotkeyModifiers={[BMK]}
          onClick={() => null}
        >
          Settings
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
          hotkey="O"
          hotkeyModifiers={[BMK]}
          disabled={store.storage.autosaveToBrowser}
          onClick={() => {
            inputProjectFileRef.current.click()
          }}
        >
          Open
        </MenuListItem>
        <MenuListItem
          IconClass={CancelPresentationIcon}
          disabled={store.storage.autosaveToBrowser}
          onClick={() => store.project.reInitializeAll()}
        >
          Close & New
        </MenuListItem>
        <Divider />
        <MenuListItem
          IconClass={SaveAsIcon}
          hotkey="S"
          hotkeyModifiers={[BMK]}
          onClick={() => store.view.openDialog('save')}
        >
          Save As
        </MenuListItem>
        <MenuListItem
          disabled={store.storage.storageEnabled === false}
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
          /* eslint-disable no-param-reassign */
          const chosenFile = event.target.files[0]
          store.project.load(chosenFile)
          event.target.value = ''
        }}
      />
    </>
  )
})

export default ProjectMenu
