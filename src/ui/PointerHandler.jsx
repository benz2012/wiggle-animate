/* eslint-disable no-param-reassign */
import { forwardRef, useCallback, useEffect } from 'react'
import { action } from 'mobx'

import Vector2 from '../structure/Vector2'

const PointerHandler = forwardRef(({ children, store }, ref) => {
  const stageRef = ref

  /* DRAG HANDLER */
  const handleDrag = action((event) => {
    const { selectedIds, dragStart } = store.build
    if (!dragStart) return

    const pointerVector = new Vector2(event.clientX * store.DPR, event.clientY * store.DPR)
    const relativeMovement = Vector2.subtract(pointerVector, dragStart)
    const relativeMovementScaledToCanvas = new Vector2(
      relativeMovement.x / store.rootContainer.canvasScale,
      relativeMovement.y / store.rootContainer.canvasScale,
    )

    if (store.view.isMoveable) {
      const relativeMovementScaledToCanvasInverse = new Vector2(
        relativeMovement.x * store.rootContainer.canvasScale,
        relativeMovement.y * store.rootContainer.canvasScale,
      )
      const newCanvasPosition = Vector2.add(
        store.rootContainer.canvasPosition,
        relativeMovementScaledToCanvasInverse,
      )
      store.rootContainer.canvasPosition = newCanvasPosition
    } else if (selectedIds.length > 0) {
      selectedIds.forEach((selectedId) => {
        const selectedItem = store.rootContainer.findItem(selectedId)
        selectedItem.position.add(relativeMovementScaledToCanvas)
      })
    } else {
      store.selector.rect.width += relativeMovement.x
      store.selector.rect.height += relativeMovement.y
    }

    // this will enable us to track distance moved since the last event
    store.startDrag(pointerVector)
  })
  const handleDragMemoized = useCallback(handleDrag, [handleDrag])

  const handlePointerEvent = (event) => {
    const pointerVector = new Vector2(event.clientX * store.DPR, event.clientY * store.DPR)
    if (event.type === 'pointermove') {
      const { dragStart } = store.build
      if (!dragStart) {
        store.rootContainer.checkPointerIntersections(pointerVector)
      } else if (dragStart && store.selector.rect.area > 0) {
        const x2 = store.selector.position.x + store.selector.rect.width
        const y2 = store.selector.position.y + store.selector.rect.height
        const intersectedIds = store.rootContainer.findRectIntersections([
          Math.min(store.selector.position.x, x2),
          Math.min(store.selector.position.y, y2),
          Math.max(store.selector.position.x, x2),
          Math.max(store.selector.position.y, y2),
        ])
        store.setSelectorHovers(intersectedIds)
      }
    } else if (event.type === 'pointerdown' && event.target === stageRef.current) {
      store.rootContainer.checkPointerIntersections(pointerVector)
      if (store.build.hoveredId) {
        if (store.build.selectedIds.length === 0) {
          store.setSelected([store.build.hoveredId])
        } else if (store.build.selectedIds.includes(store.build.hoveredId) === false) {
          store.setSelected([store.build.hoveredId])
        }
      } else {
        store.setSelected([])
      }
      store.startDrag(pointerVector)
      store.setSelectorPosition(pointerVector)
    } else if (event.type === 'pointerup') {
      store.stopDrag(pointerVector)
      store.setSelectorRect(0, 0)
      if (store.selector.hovers.length > 0) {
        store.setSelected(store.selector.hovers)
      }
      store.setSelectorHovers([])
    }
  }

  /* Window Listener Registration */
  useEffect(() => {
    window.addEventListener('pointermove', handleDragMemoized)
    return () => {
      window.removeEventListener('pointermove', handleDragMemoized)
    }
  }, [
    handleDragMemoized,
  ])

  return (
    <div
      onPointerMove={handlePointerEvent}
      onPointerDown={handlePointerEvent}
      onPointerUp={handlePointerEvent}
    >
      {children}
    </div>
  )
})

export default PointerHandler
