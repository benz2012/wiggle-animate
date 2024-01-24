import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'

import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import BuildIcon from '@mui/icons-material/Build'
import Chip from '@mui/material/Chip'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import IconButton from '@mui/material/IconButton'
import TopicIcon from '@mui/icons-material/Topic'

import './TopMenu.css'
import theme from '../theme'
import MenuButton from './MenuButton'
import ProjectMenu from './ProjectMenu'
import EditMenu from './EditMenu'
import InsertMenu from './InsertMenu'

// TODO [4]: make the button and menu animations quicker / more-snappy
// TODO [3]: allow "menu-open-rollover", once once menu is open, moving mouse over
//           the other buttons instantly opens that menu instead

const focusStage = () => setTimeout(() => document.getElementById('stage').focus(), 0)

const TopMenu = observer(({ store }) => {
  const projectMenuButtonRef = useRef(null)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const editMenuButtonRef = useRef(null)
  const [editMenuOpen, setEditMenuOpen] = useState(false)
  const insertMenuButtonRef = useRef(null)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)

  const { saveStatus } = store.project

  let color = 'success'
  if (saveStatus === 'saving') { color = 'info' }
  if (saveStatus === 'error saving') { color = 'error' }
  if (saveStatus === 'unsaved') { color = 'warning' }
  if (saveStatus === 'clean slate') { color = 'info' }

  return (
    <div id="top-menu">
      <MenuButton
        ref={projectMenuButtonRef}
        icon={<TopicIcon />}
        onClick={() => setProjectMenuOpen(!projectMenuOpen)}
      >
        Project
      </MenuButton>
      <ProjectMenu
        anchorEl={projectMenuButtonRef.current}
        open={projectMenuOpen}
        handleClose={() => {
          setProjectMenuOpen(false)
          focusStage()
        }}
        store={store}
      />

      <MenuButton
        ref={editMenuButtonRef}
        icon={<BuildIcon sx={{ width: '16px', height: '16px' }} />}
        nudge={-4}
        onClick={() => setEditMenuOpen(!editMenuOpen)}
      >
        Edit
      </MenuButton>
      <EditMenu
        anchorEl={editMenuButtonRef.current}
        open={editMenuOpen}
        handleClose={() => {
          setEditMenuOpen(false)
          focusStage()
        }}
        store={store}
      />

      <MenuButton
        ref={insertMenuButtonRef}
        icon={<AddIcon />}
        nudge={-4}
        onClick={() => setInsertMenuOpen(!insertMenuOpen)}
      >
        Insert
      </MenuButton>
      <InsertMenu
        anchorEl={insertMenuButtonRef.current}
        open={insertMenuOpen}
        handleClose={() => {
          setInsertMenuOpen(false)
          focusStage()
        }}
        store={store}
      />

      <div style={{ flexGrow: 1 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton size="small">
          <DriveFileRenameOutlineIcon sx={{ fontSize: '16px', color: `${theme.palette.action.half}` }} />
        </IconButton>
        <Box sx={{ mr: 2 }}>{store.project.name || 'Untitled Project'}</Box>
        <Chip
          label={saveStatus}
          size="small"
          color={color}
          variant="outlined"
          sx={{
            fontFamily: 'monospace',
            fontSize: '12px',
            '& .MuiChip-label': {
              paddingLeft: saveStatus === 'saved' ? '11px' : '',
              paddingRight: saveStatus === 'saved' ? '11px' : '',
            },
          }}
        />
      </Box>

      <div style={{ flexGrow: 1 }} />

      <MenuButton
        icon={<FlashOnIcon />}
        nudge={-4}
        onClick={() => store.view.openDialog('export')}
      >
        Export
      </MenuButton>

      <MenuButton
        icon={<HelpOutlineIcon />}
        onClick={() => store.view.openDialog('help')}
        noText
      />
    </div>
  )
})

export default TopMenu
