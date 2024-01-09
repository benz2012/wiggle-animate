import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import TuneIcon from '@mui/icons-material/Tune'
import TopicIcon from '@mui/icons-material/Topic'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

import './TopMenu.css'
import MenuButton from './MenuButton'
import EditMenu from './EditMenu'
import InsertMenu from './InsertMenu'

const TopMenu = observer(({ store }) => {
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
        ref={null}
        icon={<TopicIcon />}
        onClick={() => null}
      >
        Project
      </MenuButton>

      <MenuButton
        ref={editMenuButtonRef}
        icon={<TuneIcon />}
        onClick={() => setEditMenuOpen(!editMenuOpen)}
      >
        Edit
      </MenuButton>
      <EditMenu
        anchorEl={editMenuButtonRef.current}
        open={editMenuOpen}
        handleClose={() => setEditMenuOpen(false)}
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
