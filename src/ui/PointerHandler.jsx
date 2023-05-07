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

    if (store.keyHeld.Space || store.keyHeld.MiddleMouse) {
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
      store.rootContainer.moveAllSelectedByIncrement(relativeMovement)
    } else {
      store.selector.rect.width += relativeMovement.x
      store.selector.rect.height += relativeMovement.y
    }

    // this will enable us to track distance moved since the last event
    store.startDrag(pointerVector)
  })
  const handleDragMemoized = useCallback(handleDrag, [handleDrag])

  /* POINTER MOVEMENT */
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

      if (event.button === 1) { store.setKeyHeld('MiddleMouse', true) }

      if (store.build.hoveredId) {
        if (store.build.selectedIds.length === 0) {
          store.setSelected([store.build.hoveredId])
        } else if (store.build.selectedIds.includes(store.build.hoveredId) === false) {
          if (store.keyHeld.Meta || store.keyHeld.Shift) {
            store.addToSelection(store.build.hoveredId)
          } else {
            store.setSelected([store.build.hoveredId])
          }
        }
      } else {
        store.setSelected([])
      }

      store.startDrag(pointerVector)
      store.setSelectorPosition(pointerVector)
    } else if (event.type === 'pointerup') {
      if (event.button === 1) { store.setKeyHeld('MiddleMouse', false) }

      store.stopDrag(pointerVector)
      store.setSelectorRect(0, 0)

      if (store.selector.hovers.length > 0) {
        store.setSelected(store.selector.hovers)
      }

      store.setSelectorHovers([])
    }
  }

  /* SCROLL HANDLER */
  const handleWheelEvent = action((event) => {
    const { canvasScale } = store.rootContainer
    if (event.target === stageRef.current) {
      if (canvasScale <= 0.25) {
        store.rootContainer.canvasScale -= event.deltaY * 0.0001
      } else if (canvasScale <= 0.5) {
        store.rootContainer.canvasScale -= event.deltaY * 0.0002
      } else if (canvasScale <= 0.75) {
        store.rootContainer.canvasScale -= event.deltaY * 0.0003
      } else if (canvasScale <= 1) {
        store.rootContainer.canvasScale -= event.deltaY * 0.0005
      } else if (canvasScale <= 2.5) {
        store.rootContainer.canvasScale -= event.deltaY * 0.001
      } else {
        store.rootContainer.canvasScale -= event.deltaY * 0.005
      }
    }
  })

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
      onWheel={handleWheelEvent}
    >
      {children}
    </div>
  )
})

export default PointerHandler
