import { useCallback, useEffect } from 'react'
import { action } from 'mobx'
import Vector2 from '../structure/Vector2'

const KeyHandler = ({ store }) => {
  const ONE_UP = new Vector2(0, -1 * store.DPR)
  const ONE_DOWN = new Vector2(0, 1 * store.DPR)
  const ONE_LEFT = new Vector2(-1 * store.DPR, 0)
  const ONE_RIGHT = new Vector2(1 * store.DPR, 0)

  const TEN_UP = new Vector2(0, -10 * store.DPR)
  const TEN_DOWN = new Vector2(0, 10 * store.DPR)
  const TEN_LEFT = new Vector2(-10 * store.DPR, 0)
  const TEN_RIGHT = new Vector2(10 * store.DPR, 0)

  /* -- KEY DOWN -- */
  const handleKeyDownEvent = action((event) => {
    const STAGE_HAS_FOCUS = document.activeElement.id === 'stage'

    switch (event.key) {
      case ' ':
        if (!STAGE_HAS_FOCUS) break
        event.preventDefault()
        store.setKeyHeld('Space', true)
        store.setSelected([])
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
        if (!STAGE_HAS_FOCUS) break
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault()
          store.selectAll()
        }
        break

      case 'Shift':
        if (!STAGE_HAS_FOCUS) break
        store.setKeyHeld('Shift', true)
        break

      default:
        break
    }

    if (event.metaKey || event.ctrlKey) {
      store.setKeyHeld('Meta', true)
    }
  })

  /* -- KEY UP -- */
  const handleKeyUpEvent = action((event) => {
    const STAGE_HAS_FOCUS = document.activeElement.id === 'stage'
    const { selectedIds } = store.build

    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        if (!STAGE_HAS_FOCUS) break
        if (selectedIds.length > 0) {
          const itemsToDelete = selectedIds.map((selectedId) => (
            store.rootContainer.findItem(selectedId)
          ))
          store.setSelected([])
          store.setHovered(null)
          itemsToDelete.forEach((item) => { item.delete() })
        }
        break

      case ' ':
        if (!STAGE_HAS_FOCUS) break
        store.setKeyHeld('Space', false)
        break

      case 'f':
        if (!STAGE_HAS_FOCUS) break
        store.resetView()
        break

      case 'Shift':
        if (!STAGE_HAS_FOCUS) break
        store.setKeyHeld('Shift', false)
        break

      case 'Meta':
      case 'Control':
        store.setKeyHeld('Meta', false)
        break

      case 'c':
        if (!STAGE_HAS_FOCUS) break
        store.addContainer()
        break

      case 'r':
        if (!STAGE_HAS_FOCUS) break
        store.addRectangle()
        break

      case 'e':
        if (!STAGE_HAS_FOCUS) break
        store.addEllipse()
        break

      case 'ArrowUp':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_UP)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_UP)
        }
        break
      case 'ArrowDown':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_DOWN)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_DOWN)
        }
        break
      case 'ArrowLeft':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_LEFT)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_LEFT)
        }
        break
      case 'ArrowRight':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_RIGHT)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_RIGHT)
        }
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

export default KeyHandler
