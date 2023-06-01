import { useRef, useState } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Portal } from '@mui/base'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

import { PANEL_WIDTH, EXPANSION_DURATION } from './config'
import Header from './Header'
import Contents from './Contents'

const PropertyEditor = observer(({ store }) => {
  // TODO: support multi-selected property edit case
  // TODO: add a menu button to reset the position of the editor in case user moves it off screen

  const { build, rootContainer } = store
  const { selectedIds } = build
  const selectedItem = selectedIds.length === 1 && rootContainer.findItem(selectedIds[0])

  const contentsMeasurerRef = useRef(null)

  const [expanded, setExpanded] = useState(true)
  const [expansionAnimationDone, setAnimationDone] = useState(true)
  const expand = () => {
    setAnimationDone(false)
    setTimeout(() => { setExpanded(true) }) // needs 1 tick to render initial css
    setTimeout(() => { setAnimationDone(true) }, EXPANSION_DURATION + 1)
  }
  const contract = () => {
    setExpanded(false)
    setAnimationDone(false)
    setTimeout(() => { setAnimationDone(true) }, EXPANSION_DURATION + 1)
  }

  const startDrag = (event) => {
    const dragStart = { pointer: { x: event.clientX, y: event.clientY }, panel: store.propertyEditor.position.object }
    const handlePointerMove = action((moveEvent) => {
      const newX = (dragStart.pointer.x - moveEvent.clientX) + dragStart.panel.x
      const newY = (moveEvent.clientY - dragStart.pointer.y) + dragStart.panel.y
      store.setPropertyEditorPosition({ x: newX, y: newY })
    })
    window.addEventListener('pointermove', handlePointerMove)

    const stopDrag = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDrag)
    }
    window.addEventListener('pointerup', stopDrag)
  }

  const setter = action((event) => {
    const { value } = event.target
    selectedItem.name = value
  })

  return (
    <Portal>
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          width: PANEL_WIDTH,
          minHeight: 32,
          zIndex: 1000,
          top: store.propertyEditor.position.y,
          right: store.propertyEditor.position.x,

          borderRadius: 2,
          backgroundImage: (theme) => {
            const { hover } = theme.palette.action
            return (
              `linear-gradient(${hover}, ${hover})`
            )
          },
        }}
      >

        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
          <Header
            expanded={expanded}
            setExpanded={expanded ? contract : expand}
            startDrag={startDrag}
          />
        </Box>

        {(expanded || !expansionAnimationDone) && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              transition: `height ${EXPANSION_DURATION}ms`,
              height: expanded ? contentsMeasurerRef.current?.clientHeight : 0,
            }}
          >
            <Box
              ref={contentsMeasurerRef}
              sx={{
                p: 1,
                transition: `clip-path ${EXPANSION_DURATION}ms`,
                clipPath: expanded
                  ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                  : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
              }}
            >
              <Contents
                numSelected={selectedIds.length}
                selectedItem={selectedItem}
                setter={setter}
              />
            </Box>
          </Paper>
        )}

      </Paper>
    </Portal>
  )
})

export default PropertyEditor
