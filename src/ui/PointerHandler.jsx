/* eslint-disable no-param-reassign */
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { action } from 'mobx'

import Vector2 from '../lib/structure/Vector2'

const PointerHandler = forwardRef(({ children, store }, ref) => {
  const stageRef = ref
  const startDragInitialWaitTimeoutId = useRef(null)

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
    const { selectedIds, dragStart, tool } = store.build
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
      } else if (tool === store.tools.PATH) {
        // PASS in this scenario
      } else if (tool === store.tools.RESIZE) {
        store.rootContainer.resizeAllSelectedByIncrement(relativeMovement)
      } else if (tool === store.tools.ROTATE) {
        store.rootContainer.rotateAllSelectedToPoint(pointerVector)
      } else if (selectedIds.length > 0) {
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

    // Note: This is NOT drag handling, see above
    if (event.type === 'pointermove') {
      store.setPointerPosition(pointerVector) // keep track of this for all potential needs

      const { dragStart, tool, selectedIds } = store.build
      const { playheadDragStart } = store.view

      // Specific scenarios when we should check for intersections like hovers/etc
      const draggingAnItem = (dragStart && selectedIds.length > 0)
      if (tool === store.tools.RESIZE) {
        store.rootContainer.checkPointerIntersections(pointerVector)
      } else if (tool === store.tools.PATH) {
        // PASS in this scenario
      } else if (!draggingAnItem) {
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

      if (dragStart && store.selector.rect.area > 0) {
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
      /* POINTER DOWN / CLICK */
      if (event.target === stageRef.current) {
        if (event.button === 1) { store.setKeyHeld('MiddleMouse', true) }

        if (
          store.build.tool === store.tools.PATH
          && !(store.keyHeld.Space || store.keyHeld.MiddleMouse)
        ) {
          // IF Space/MiddleMouse, User must be moving the canvas, so skip path tool interactions

          if (!store.build.activePath) {
            store.addNewPath()
          }

          const shouldCommit = store.build.activePath.addPoint(pointerVector)
          if (shouldCommit) {
            store.commitPath()
            return
          }
        } else {
          // Only check pointer intersections if no tools are active
          store.rootContainer.checkPointerIntersections(pointerVector)
        }

        const { hoveredId, hoveredControl } = store.build
        if (hoveredId && hoveredId.includes('--handle--')) {
          store.setActiveControl(hoveredId)
          const handleControlTool = hoveredControl && hoveredControl.replace('handle--', '').split('--')[0]
          store.setTool(handleControlTool)
        } else if (hoveredId) {
          if (store.build.selectedIds.length === 0) {
            store.setSelected([hoveredId])
          } else if (store.build.selectedIds.includes(hoveredId) === false) {
            if (store.keyHeld.Meta || store.keyHeld.Shift) {
              store.addToSelection(hoveredId)
            } else {
              store.setSelected([hoveredId])
            }
          }
        } else {
          store.setSelected([])
        }

        /* START DRAG LOGIC */
        // Wait 50ms before starting a drag in case user has already let up on mouse
        // this prevents "micro movements" in an Item's position from just trying to
        // select it, but indicate the 'grab' hand immediatley for smoother UX
        store.indicatePreDrag(true)
        startDragInitialWaitTimeoutId.current = setTimeout(
          () => store.startDrag(pointerVector),
          50
        )
        store.setSelectorPosition(pointerVector)
      } else if (event.target.id === 'playhead-canvas') {
        store.startPlayheadDrag(pointerVectorRatioOne)
        store.setPlayheadHovered(true)
        store.setPlayheadHoverLineFrame(null)
        goToFrameWithPointerX(pointerVectorRatioOne.x)
      }
    } else if (event.type === 'pointerup') {
      /* POINTER UP / END-OF-DRAG */
      if (event.button === 1) { store.setKeyHeld('MiddleMouse', false) }

      clearTimeout(startDragInitialWaitTimeoutId.current)
      store.stopDrag()
      store.setSelectorRect(0, 0)
      store.stopPlayheadDrag()

      if (store.selector.hovers.length > 0) {
        store.setSelected(store.selector.hovers)
      }

      if ([store.tools.RESIZE, store.tools.ROTATE].includes(store.build.tool)) {
        store.setTool(store.tools.NONE)
      }
      store.setActiveControl(null)

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
