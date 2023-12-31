import { useCallback, useEffect } from 'react'
import { action } from 'mobx'
import Vector2 from '../lib/structure/Vector2'
import Animation from '../lib/animation/Animation'

const doesStageHaveFocus = () => [
  'stage',
  'left-menu-container',
].includes(document.activeElement.id)

const doesBottomMenuHaveFocus = () => [
  'bottom-menu',
  'play-pause-button',
  'jump-start-button',
  'jump-end-button',
  'play-mode-button',
].includes(document.activeElement.id)

const doesAnInputFieldHaveFocus = () => document.activeElement.id.startsWith('input-')

// TODO [4]: periodically check the keys in case someone scrolled away and came back and is no longer holding down
//       a meta key (or others). maybe this could be checked when window gets focused?
//       basically there is a bug now where it's stuck on the "add item to selection" cursor

const KeyHandler = ({ store }) => {
  const ONE_UP = new Vector2(0, -1)
  const ONE_DOWN = new Vector2(0, 1)
  const ONE_LEFT = new Vector2(-1, 0)
  const ONE_RIGHT = new Vector2(1, 0)

  const TEN_UP = new Vector2(0, -10)
  const TEN_DOWN = new Vector2(0, 10)
  const TEN_LEFT = new Vector2(-10, 0)
  const TEN_RIGHT = new Vector2(10, 0)

  /* -- KEY DOWN -- */
  const handleKeyDownEvent = action((event) => {
    const STAGE_HAS_FOCUS = doesStageHaveFocus()
    const BOTTOM_HAS_FOCUS = doesBottomMenuHaveFocus()
    const INPUT_HAS_FOCUS = doesAnInputFieldHaveFocus()

    switch (event.key) {
      case ' ':
        if (BOTTOM_HAS_FOCUS && document.activeElement.id !== 'play-pause-button') {
          document.getElementById('play-pause-button').focus()
          document.getElementById('play-pause-button').click()
        } else if (STAGE_HAS_FOCUS) {
          event.preventDefault()
          store.keyHeld.setKey('Space', true)
        }
        break

      case '-':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault()
          store.rootContainer.decrementScale()
        }
        break

      case '=':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault()
          store.rootContainer.incrementScale()
        }
        break

      case 'a':
        if (event.metaKey || event.ctrlKey) {
          if (BOTTOM_HAS_FOCUS) {
            event.preventDefault()
            store.keyframeEditor.selectAllVisible()
          } else if (STAGE_HAS_FOCUS) {
            event.preventDefault()
            store.build.selectAll()
          }
        }
        break

      case 'd':
        if (event.metaKey || event.ctrlKey) {
          if (BOTTOM_HAS_FOCUS) {
            event.preventDefault()
            store.keyframeEditor.setSelected([])
          } else if (STAGE_HAS_FOCUS) {
            event.preventDefault()
            store.build.setSelected([])
          }
        }
        break

      case 'Shift':
        if (!(STAGE_HAS_FOCUS || BOTTOM_HAS_FOCUS)) break
        store.keyHeld.setKey('Shift', true)
        break

      case 'ArrowUp':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_UP, true)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_UP, true)
        }
        break
      case 'ArrowDown':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_DOWN, true)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_DOWN, true)
        }
        break
      case 'ArrowLeft':
        if ((event.metaKey || event.ctrlKey) && !INPUT_HAS_FOCUS) {
          // Prevents accidental page navigation
          event.preventDefault()
        }
        if (BOTTOM_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.animation.goToFirst()
          } else {
            store.animation.goToPrev()
          }
        } else if (STAGE_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.rootContainer.moveAllSelectedByIncrement(TEN_LEFT, true)
          } else {
            store.rootContainer.moveAllSelectedByIncrement(ONE_LEFT, true)
          }
        }
        break
      case 'ArrowRight':
        if ((event.metaKey || event.ctrlKey) && !INPUT_HAS_FOCUS) {
          // Prevents accidental page navigation
          event.preventDefault()
        }
        if (BOTTOM_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.animation.goToLast()
          } else {
            store.animation.goToNext()
          }
        } else if (STAGE_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.rootContainer.moveAllSelectedByIncrement(TEN_RIGHT, true)
          } else {
            store.rootContainer.moveAllSelectedByIncrement(ONE_RIGHT, true)
          }
        }
        break

      default:
        break
    }

    if (event.metaKey || event.ctrlKey) {
      store.keyHeld.setKey('Meta', true)
    }
  })

  /* -- KEY UP -- */
  const handleKeyUpEvent = action((event) => {
    const STAGE_HAS_FOCUS = doesStageHaveFocus()
    const BOTTOM_HAS_FOCUS = doesBottomMenuHaveFocus()

    const { selectedIds } = store.build

    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        if (BOTTOM_HAS_FOCUS && store.keyframeEditor.selectedIds.length > 0) {
          store.keyframeEditor.selectedIds.forEach((keyframeFullId) => {
            const [itemId, propertyName, keyframeId] = keyframeFullId.split('--')
            const item = store.rootContainer.findItem(itemId)
            item[propertyName].deleteKey(keyframeId)
          })
          store.keyframeEditor.setSelected([])
        } else if (STAGE_HAS_FOCUS && selectedIds.length > 0) {
          const itemsToDelete = selectedIds.map((selectedId) => (
            store.rootContainer.findItem(selectedId)
          ))
          store.build.setSelected([])
          store.build.setHovered(null)
          itemsToDelete.forEach((item) => { item.delete() })
        }
        break

      case 'Escape':
        if (!STAGE_HAS_FOCUS) break
        if (store.build.tool === store.tools.PATH) {
          store.stage.commitPath()
        }
        break

      case ' ':
        store.keyHeld.setKey('Space', false)
        break

      case 'f':
        if (!STAGE_HAS_FOCUS) break
        store.view.reset()
        break

      case 'Shift':
        store.keyHeld.setKey('Shift', false)
        break

      case 'Meta':
      case 'Control':
        store.keyHeld.setKey('Meta', false)
        break

      case 'c':
        if (BOTTOM_HAS_FOCUS) {
          store.animation.setIn(Animation.FIRST)
          store.animation.setOut(store.animation.frames)
        } else if (STAGE_HAS_FOCUS) {
          store.stage.addContainer()
        }
        break

      case 'r':
        if (!STAGE_HAS_FOCUS) break
        store.stage.addRectangle()
        break

      case 'e':
        if (!STAGE_HAS_FOCUS) break
        store.stage.addEllipse()
        break

      case 't':
        if (!STAGE_HAS_FOCUS) break
        store.stage.addText()
        break

      case 'y':
        if (!STAGE_HAS_FOCUS) break
        store.stage.addPolygon()
        break

      case 'l':
        if (!STAGE_HAS_FOCUS) break
        store.stage.addLine()
        break

      case 'p':
        if (!STAGE_HAS_FOCUS) break
        store.build.setTool(store.tools.PATH)
        break

      case 'i':
        if (!BOTTOM_HAS_FOCUS) break
        store.animation.setIn(store.animation.now)
        break

      case 'o':
        if (!BOTTOM_HAS_FOCUS) break
        store.animation.setOut(store.animation.now)
        break

      default:
        break
    }
  })

  /* Memoization */
  const handleKeyDownEventMemoized = useCallback(handleKeyDownEvent, [handleKeyDownEvent])
  const handleKeyUpEventMemoized = useCallback(handleKeyUpEvent, [handleKeyUpEvent])

  /* Window Listener Registration */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownEventMemoized)
    window.addEventListener('keyup', handleKeyUpEventMemoized)
    return () => {
      window.removeEventListener('keydown', handleKeyDownEventMemoized)
      window.removeEventListener('keyup', handleKeyUpEventMemoized)
    }
  }, [
    handleKeyDownEventMemoized,
    handleKeyUpEventMemoized,
  ])

  return null
}

export { doesBottomMenuHaveFocus }
export default KeyHandler
