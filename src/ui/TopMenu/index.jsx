import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import throttle from 'lodash.throttle'

import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import TopicIcon from '@mui/icons-material/Topic'

import './TopMenu.css'
import MenuButton from './MenuButton'
import ProjectMenu from './ProjectMenu'
import EditMenu from './EditMenu'
import InsertMenu from './InsertMenu'
import CenterSection from './CenterSection'
import { voidFunc } from '../../utility/object'

// TODO [2]: finish the help-page branch work
// TODO [4]: make the button and menu animations quicker / more-snappy

const focusStage = () => setTimeout(() => document.getElementById('stage').focus(), 0)

const TopMenu = observer(({ store }) => {
  const projectMenuButtonRef = useRef(null)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const editMenuButtonRef = useRef(null)
  const [editMenuOpen, setEditMenuOpen] = useState(false)
  const insertMenuButtonRef = useRef(null)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)

  /* Allows Menu-Open-Rollover effect to happen between the menu buttons.
   * Meaning, when one menu is open, simply hovering your mouse over one of the other menu
   * buttons will immediatly open that menu and close the original menu.
   */
  useEffect(() => {
    if (![projectMenuOpen, editMenuOpen, insertMenuOpen].some((bool) => bool)) return voidFunc

    const shouldOpenOtherMenu = (event) => {
      const elements = document.elementsFromPoint(event.clientX, event.clientY)
      let setCurrentMenu
      let otherRefsAndSetters

      if (projectMenuOpen) {
        setCurrentMenu = setProjectMenuOpen
        otherRefsAndSetters = [
          [editMenuButtonRef, setEditMenuOpen],
          [insertMenuButtonRef, setInsertMenuOpen],
        ]
      } else if (editMenuOpen) {
        setCurrentMenu = setEditMenuOpen
        otherRefsAndSetters = [
          [projectMenuButtonRef, setProjectMenuOpen],
          [insertMenuButtonRef, setInsertMenuOpen],
        ]
      } else if (insertMenuOpen) {
        setCurrentMenu = setInsertMenuOpen
        otherRefsAndSetters = [
          [projectMenuButtonRef, setProjectMenuOpen],
          [editMenuButtonRef, setEditMenuOpen],
        ]
      }

      elements.some((element) => (
        otherRefsAndSetters.some(([otherRef, otherSetter]) => {
          if (element === otherRef.current) {
            setCurrentMenu(false)
            otherSetter(true)
            return true
          }
          return false
        })
      ))
    }

    const shouldOpenOtherMenuThrottled = throttle(shouldOpenOtherMenu, 50)
    window.addEventListener('pointermove', shouldOpenOtherMenuThrottled)
    return () => window.removeEventListener('pointermove', shouldOpenOtherMenuThrottled)
  }, [
    projectMenuOpen,
    editMenuOpen,
    insertMenuOpen,
  ])

  return (
    <div id="top-menu">
      <MenuButton
        ref={projectMenuButtonRef}
        icon={<TopicIcon />}
        onClick={() => setProjectMenuOpen(!projectMenuOpen)}
        menuOpen={projectMenuOpen}
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
        menuOpen={editMenuOpen}
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
        menuOpen={insertMenuOpen}
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

      <CenterSection store={store} />

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
