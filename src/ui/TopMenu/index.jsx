import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import TopicIcon from '@mui/icons-material/Topic'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

// TODO [4]: make the button and menu animations quicker / more-snappy

import './TopMenu.css'
import MenuButton from './MenuButton'
import ProjectMenu from './ProjectMenu'
import EditMenu from './EditMenu'
import InsertMenu from './InsertMenu'

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
  if (saveStatus === 'unknown') { color = 'warning' }

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
        handleClose={() => setProjectMenuOpen(false)}
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
        handleClose={() => setEditMenuOpen(false)}
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
        handleClose={() => setInsertMenuOpen(false)}
        store={store}
      />

      <div style={{ flexGrow: 1 }} />

      <div>Project Name</div>
      <Chip label={saveStatus} size="small" color={color} />

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
