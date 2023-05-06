import { useCallback, useEffect } from 'react'
import { action } from 'mobx'

const KeyHandler = ({ store }) => {
  /* -- KEY DOWN -- */
  const handleKeyDownEvent = action((event) => {
    switch (event.key) {
      case ' ':
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
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault()
          store.selectAll()
        }
        break

      case 'Shift':
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
    const { selectedIds } = store.build

    switch (event.key) {
      case 'Backspace':
      case 'Delete':
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
        store.setKeyHeld('Space', false)
        break

      case 'f':
        store.resetView()
        break

      case 'Shift':
        store.setKeyHeld('Shift', false)
        break

      case 'Meta':
      case 'Control':
        store.setKeyHeld('Meta', false)
        break

      case 'n':
        store.addContainer()
        break

      case 'r':
        store.addRect()
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
