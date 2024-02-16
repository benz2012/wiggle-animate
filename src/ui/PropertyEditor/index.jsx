import { useEffect, useRef, useState } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Portal } from '@mui/base'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

import { PANEL_WIDTH, EXPANSION_DURATION } from './config'
import Header from './Header'
import Contents from './Contents'
import usePrevious from '../hooks/usePrevious'

// TODO [2]: add little key button next to each property to make a keyframe

// TODO [3]: The panel doesn't contract sometimes when multiple items are selected
//           weirdly it's related to the sorting of the items.
//           Multi-Selecting "upwards" causes panel to close, "downwards" does not

// TODO [4]: Annoying scroll bar appears when panel expands (with dedicated mouse, not trackpad)

const PropertyEditor = observer(({ store }) => {
  // TODO [4]: Support multi-selected property edit case
  //       Add a box to the top for "Set To | Change By"
  //       Add question mark that explains the difference with a GIF

  // SETTINGS MENU TODO [3]:
  //  - reset the position of the editor
  //  - Live Update |or| Update on Enter
  //  - ClickAway Updates Value |or| Ignores Value
  //  - Dock Panel on right side, fill page vertically
  //  - hide when playing animation
  //  - - hide forever, show again after animation stopped
  //  - First Item Auto-Open
  //  - Show/hide Keyframe button: default show

  const { build, rootContainer } = store
  const { selectedIds } = build
  const selectedItem = rootContainer.findItem(selectedIds[0]) || {}
  const numTopLevelItems = rootContainer.sortOrder.length
  const prevNumTopLevelItems = usePrevious(numTopLevelItems)

  const contentsMeasurerRef = useRef(null)

  const [expanded, setExpanded] = useState(false)
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
  useEffect(() => {
    if (!prevNumTopLevelItems && numTopLevelItems) {
      // Force expand the property editor when first item added to stage
      expand()
    } else if (prevNumTopLevelItems && !numTopLevelItems) {
      // Force close the property editor when last item removed from stage
      contract()
    }
  }, [numTopLevelItems, prevNumTopLevelItems])

  const [isDragging, setIsDragging] = useState(false)
  const startDrag = (event) => {
    const dragStart = { pointer: { x: event.clientX, y: event.clientY }, panel: store.propertyEditor.position.object }
    const handlePointerMove = action((moveEvent) => {
      const newX = (dragStart.pointer.x - moveEvent.clientX) + dragStart.panel.x
      const newY = (moveEvent.clientY - dragStart.pointer.y) + dragStart.panel.y
      store.propertyEditor.setPosition({ x: newX, y: newY })
    })
    window.addEventListener('pointermove', handlePointerMove)
    setIsDragging(true)

    const stopDrag = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDrag)
      setIsDragging(false)
    }
    window.addEventListener('pointerup', stopDrag)
  }

  const [contentHeight, setContentHeight] = useState(0)
  const groupToggles = JSON.stringify(store.propertyEditor.hiddenGroups)
  useEffect(() => {
    if (expanded && !expansionAnimationDone) return
    setContentHeight(contentsMeasurerRef.current?.clientHeight)
  }, [selectedItem.id, expanded, expansionAnimationDone, groupToggles])

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
            isDragging={isDragging}
          />
        </Box>

        {(expanded || !expansionAnimationDone) && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              transition: `height ${EXPANSION_DURATION}ms`,
              height: expanded ? contentHeight : 0,
              maxHeight: '75vh',
              overflow: 'auto',
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
                store={store}
                numSelected={selectedIds.length}
                selectedItem={selectedItem}
              />
            </Box>
          </Paper>
        )}

      </Paper>
    </Portal>
  )
})

export default PropertyEditor
