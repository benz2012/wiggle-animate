/* eslint-disable no-param-reassign */
import { forwardRef, useCallback, useEffect } from 'react'
import { action } from 'mobx'

import Vector2 from '../lib/structure/Vector2'

const PointerHandler = forwardRef(({ children, store }, ref) => {
  const stageRef = ref

  /* Convienience Methods */
  const getFrameWithPointerX = (pointerX) => {
    // TODO: playheadCSSTrueHalf should be in the store
    const playheadCSSTrueHalf = 7
    const distanceFromPlayheadOne = (
      pointerX
      - store.view.playheadCSSFrameOneStart
      + (store.view.playheadPixelsPerFrame * 1)
      - playheadCSSTrueHalf
    )
    const frameToGoToFloat = distanceFromPlayheadOne / store.view.playheadPixelsPerFrame
    const frameToGoTo = Math.round(frameToGoToFloat)
    return frameToGoTo
  }
  const goToFrameWithPointerX = (pointerX) => {
    store.animation.goToFrame(getFrameWithPointerX(pointerX))
  }

  /* DRAG HANDLER */
  const handleDrag = action((event) => {
    const { selectedIds, dragStart } = store.build
    const { playheadDragStart } = store.view

    if (dragStart) {
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
        // TODO: movement vectors need to be converted into a childs space before being applied
        // otherwise if a parent is scaled/rotated the vector will be incorrect
        // aka, your mouse only moves in 1:1-scale and 0 rotation world, but the children of
        // parents are not garunteed to be in that space
        store.rootContainer.moveAllSelectedByIncrement(relativeMovement)
      } else {
        store.selector.rect.width += relativeMovement.x
        store.selector.rect.height += relativeMovement.y
      }

      // this will enable us to track distance moved since the last event
      store.startDrag(pointerVector)
    } else if (playheadDragStart) {
      const pointerVector = new Vector2(event.clientX, event.clientY)
      goToFrameWithPointerX(pointerVector.x)
    }
  })
  const handleDragMemoized = useCallback(handleDrag, [handleDrag])

  /* POINTER MOVEMENT */
  const handlePointerEvent = (event) => {
    const pointerVector = new Vector2(event.clientX * store.DPR, event.clientY * store.DPR)
    const pointerVectorRatioOne = new Vector2(event.clientX, event.clientY)

    if (event.type === 'pointermove') {
      // Note: This is not drag handling, see above
      const { dragStart } = store.build
      const { playheadDragStart } = store.view

      if (!dragStart) {
        if (!store.build.tool) {
          // Don't check for pointer intersections with other shapes if a tool is active
          store.rootContainer.checkPointerIntersections(pointerVector)
        }

        // Tool operations within the stage, when not dragging
        if (event.target.id === 'stage') {
          // Path Builder Tool
          if (store.build.tool === store.tools.PATH) {
            let hoveringNearStartPoint = false
            // you can't close a path with less than 3 points, so don't show the hoverNearStart interaction
            if (store.build.activePath && store.build.activePath.points.length > 2) {
              hoveringNearStartPoint = store.build.activePath.pointerNearStart(pointerVector)
            }

            if (hoveringNearStartPoint) {
              store.setPointerPosition(null)
            } else {
              store.setPointerPosition(pointerVector)
            }
          }
        }

        if (!playheadDragStart && event.target.id === 'playhead-canvas') {
          // check for playhead hover
          const playheadBucketToCheck = store.view.playheadCSSFrameOneStart
            + ((store.animation.now - 1) * store.view.playheadPixelsPerFrame)
          const pointerX = pointerVectorRatioOne.x
          // TODO: this should be in the store
          const playheadCSSTrueHalf = 7
          if (
            pointerX >= playheadBucketToCheck
            && pointerX <= playheadBucketToCheck + playheadCSSTrueHalf * 2
          ) {
            store.setPlayheadHovered(true)
            store.setPlayheadHoverLineFrame(null)
          } else {
            store.setPlayheadHovered(false)
            const lineFrame = getFrameWithPointerX(pointerX)
            store.setPlayheadHoverLineFrame(lineFrame)
          }
        } else if (!playheadDragStart) {
          store.setPlayheadHovered(false)
          store.setPlayheadHoverLineFrame(null)
        }
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
    } else if (event.type === 'pointerdown') {
      if (event.target.getAttribute('data-capture-click-id') === 'insert-menu-start-path-tool') {
        // allows the PotentialPointerPoint to render when someone launches the tool from the menu
        // this will also happen as soon as they move the mouse, but since we are rendering the mouse
        // as "none" once the tool is active, we want the PPP to be rendered immediatley to prevent
        // a jarring UX
        store.setPointerPosition(pointerVector)
      }

      if (event.target === stageRef.current) {
        if (event.button === 1) { store.setKeyHeld('MiddleMouse', true) }

        if (store.build.tool === store.tools.PATH) {
          if (!store.build.activePath) {
            store.addNewPath()
          }

          const shouldCommit = store.build.activePath.addPoint(pointerVector)
          if (shouldCommit) {
            store.commitPath()
            return
          }
        } else {
          // Don't check for pointer intersections with other shapes if a tool is active
          store.rootContainer.checkPointerIntersections(pointerVector)
        }

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

        if (!store.build.tool) {
          // Don't activate a shape drag or selector drag if a tool is active
          store.startDrag(pointerVector)
          store.setSelectorPosition(pointerVector)
        }
      } else if (event.target.id === 'playhead-canvas') {
        store.startPlayheadDrag(pointerVectorRatioOne)
        store.setPlayheadHovered(true)
        store.setPlayheadHoverLineFrame(null)
        goToFrameWithPointerX(pointerVectorRatioOne.x)
      }
    } else if (event.type === 'pointerup') {
      if (event.button === 1) { store.setKeyHeld('MiddleMouse', false) }

      store.stopDrag()
      store.setSelectorRect(0, 0)
      store.stopPlayheadDrag()

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
