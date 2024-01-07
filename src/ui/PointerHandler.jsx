/* eslint-disable no-param-reassign */
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { action } from 'mobx'

import Vector2 from '../lib/structure/Vector2'

const PointerHandler = forwardRef(({ children, store }, ref) => {
  const stageRef = ref
  const startDragInitialWaitTimeoutId = useRef(null)
  const startDragLeftMenuInitialWaitTimeoutId = useRef(null)
  const waitingToOpenContainerIntervalId = useRef(null)

  /* Convienience Methods */
  const getFrameWithPointerX = (pointerX) => {
    const distanceFromPlayheadOne = (
      pointerX
      - store.playhead.cssFrameOneStart
      + (store.playhead.pixelsPerFrame * 1)
      - store.playhead.cssTrueHalf
    )
    const frameToGoToFloat = distanceFromPlayheadOne / store.playhead.pixelsPerFrame
    const frameToGoTo = Math.round(frameToGoToFloat)
    return frameToGoTo
  }
  const goToFrameWithPointerX = (pointerX) => {
    store.animation.goToFrame(getFrameWithPointerX(pointerX))
  }

  /* DRAG HANDLER */
  const handleDrag = action((event) => {
    const { selectedIds, dragStart, tool, pseudoTool, activePoint } = store.build
    const { dragStart: playheadDragStart } = store.playhead
    const { dragStart: keyframeDragStart } = store.keyframeEditor
    const { dragStart: curveHandleDragStart, dragStartWhichHandle: whichCurveControlHandle } = store.curveEditor
    const { dragStart: leftMenuDragStart } = store.leftMenu

    const pointerVector = new Vector2(event.clientX * store.DPR, event.clientY * store.DPR)

    if (dragStart) {
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
        if (activePoint) {
          const [_, itemId] = activePoint.split('--')
          const onePath = store.rootContainer.findItem(itemId)
          onePath.moveActivePointByIncrement(relativeMovement)
        }
      } else if (tool === store.tools.RESIZE) {
        store.rootContainer.resizeAllSelectedByIncrement(relativeMovement)
      } else if (tool === store.tools.ROTATE) {
        store.rootContainer.rotateAllSelectedToPoint(pointerVector)
      } else if (pseudoTool === store.tools.POINT && activePoint) {
        const onePath = store.rootContainer.findItem(selectedIds[0])
        onePath.moveActivePointByIncrement(relativeMovement)
      } else if (pseudoTool === store.tools.POINT && store.keyHeld.Alt) {
        // PASS in this scenario
      } else if (selectedIds.length > 0) {
        store.rootContainer.moveAllSelectedByIncrement(relativeMovement)
      } else {
        const newWidth = store.selector.rect.width + relativeMovement.x
        const newHeight = store.selector.rect.height + relativeMovement.y
        store.selector.setRect(newWidth, newHeight)
      }

      // this will enable us to track distance moved since the last event
      store.build.startDrag(pointerVector)
      //
    } else if (playheadDragStart) {
      goToFrameWithPointerX(event.clientX)
      //
    } else if (keyframeDragStart) {
      store.keyframeEditor.moveAllSelectedToFrameForX(event.clientX, Math.sign(event.movementX))
      //
    } else if (curveHandleDragStart) {
      const relativeMovement = Vector2.subtract(pointerVector, curveHandleDragStart)
      store.curveEditor.moveHandleByIncrement(relativeMovement)
      store.curveEditor.startDrag(pointerVector, whichCurveControlHandle)
      //
    } else if (leftMenuDragStart) {
      const { containerToOpen } = store.leftMenu
      const containerId = store.leftMenu.closedContainerHovered()
      if (containerId !== containerToOpen) {
        clearInterval(waitingToOpenContainerIntervalId.current)
        store.leftMenu.clearContainerToOpen()
        if (containerId) {
          store.leftMenu.incrementContainerToOpen(containerId)
          waitingToOpenContainerIntervalId.current = setInterval(
            () => {
              const shouldClearSelf = store.leftMenu.incrementContainerToOpen(containerId)
              if (shouldClearSelf) clearInterval(waitingToOpenContainerIntervalId.current)
            },
            100,
          )
        }
      }
      //
    }
  })
  const handleDragMemoized = useCallback(handleDrag, [handleDrag])

  /* MAIN POINTER EVENTS */
  const handlePointerEvent = (event) => {
    const pointerVector = new Vector2(event.clientX * store.DPR, event.clientY * store.DPR)
    const pointerVectorRatioOne = new Vector2(event.clientX, event.clientY)

    if (event.type === 'pointermove') {
      /* POINTER MOVEMENT */
      // Note: This is NOT drag handling, see above

      store.build.setPointerPosition(pointerVector) // keep track of this for all potential needs

      const { dragStart, tool, pseudoTool, selectedIds } = store.build
      const { dragStart: playheadDragStart } = store.playhead

      // Specific scenarios when we should check for intersections like hovers/etc
      const draggingAnItem = (dragStart && selectedIds.length > 0)
      if (tool === store.tools.RESIZE) {
        store.rootContainer.checkPointerIntersections(pointerVector)
      } else if (tool === store.tools.PATH) {
        // PASS in this scenario
      } else if (pseudoTool === store.tools.POINT) {
        const onePath = store.rootContainer.findItem(selectedIds[0])
        onePath.checkPointAndControlIntersections(pointerVector)
        store.rootContainer.checkPointerIntersections(pointerVector)
      } else if (!draggingAnItem) {
        store.rootContainer.checkPointerIntersections(pointerVector)
      }

      // Tool operations within the stage, when not dragging
      if (event.target.id === 'stage') {
        // Path Builder Tool
        if (store.build.tool === store.tools.PATH) {
          let hoveringNearStartPoint = false
          // you can't close a path with less than 3 points, so don't show the hoverNearStart interaction
          // TODO [4]: technically this isn't true, you can close a bezier path with 2 points
          //           so I need to design a solution for that
          if (store.build.activePath && store.build.activePath.points.length > 2) {
            hoveringNearStartPoint = store.build.activePath.pointerNearStart(pointerVector)
          }

          if (hoveringNearStartPoint) {
            store.build.setPointerPosition(null)
          } else {
            store.build.setPointerPosition(pointerVector)
          }
        }
      }

      if (!playheadDragStart && event.target.id === 'playhead-canvas') {
        // check for playhead hover
        const playheadBucketToCheck = store.playhead.cssFrameOneStart
          + ((store.animation.now - 1) * store.playhead.pixelsPerFrame)
        const pointerX = pointerVectorRatioOne.x
        if (
          pointerX >= playheadBucketToCheck
          && pointerX <= playheadBucketToCheck + store.playhead.cssTrueHalf * 2
        ) {
          store.playhead.setHovered(true)
          store.playhead.setHoverLineFrame(null)
        } else {
          store.playhead.setHovered(false)
          const lineFrame = getFrameWithPointerX(pointerX)
          store.playhead.setHoverLineFrame(lineFrame)
        }
      } else if (!playheadDragStart) {
        store.playhead.setHovered(false)
        store.playhead.setHoverLineFrame(null)
      }

      // Note: Curve Editor Pointer Intersections are checked directly within that component
      // TODO [4]: maybe move those into this module

      if (['keyframe-line', 'keyframe-item'].includes(event.target.id.split('--')[0])) {
        const hoveredKeyframePropLabel = event.target.id.split('--').pop()
        const mouseLeftRelativeToHoverRegion = event.clientX - event.target.offsetParent.offsetLeft
        store.keyframeEditor.setHoveredProperty(hoveredKeyframePropLabel)
        store.keyframeEditor.setNewKeyPosition(mouseLeftRelativeToHoverRegion)
      } else if (store.keyframeEditor.hoveredProperty !== null) {
        // This is efficitvley an `else` statement but protected against overuse by pointer movement
        store.keyframeEditor.setHoveredProperty(null)
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
        store.selector.setHovers(intersectedIds)
      }

      if (event.target.id.startsWith('left-menu-item')) {
        const leftMenuItemId = event.target.id.split('--').pop()
        store.leftMenu.setHovered(leftMenuItemId)
      } else if (store.leftMenu.hoveredId !== null) {
        // This is efficitvley an `else` statement but protected against overuse by pointer movement
        store.leftMenu.setHovered(null)
      }
    } else if (event.type === 'pointerdown') {
      /* POINTER DOWN / CLICK */
      if (event.target === stageRef.current) {
        if (event.button === 1) { store.keyHeld.setKey('MiddleMouse', true) }

        if (
          store.build.tool === store.tools.PATH
          && !(store.keyHeld.Space || store.keyHeld.MiddleMouse)
        ) {
          // IF Space/MiddleMouse, User must be moving the canvas, so skip path tool interactions

          if (!store.build.activePath) {
            store.stage.addNewPath()
          }

          const shouldCommit = store.build.activePath.addPoint(pointerVector)
          if (shouldCommit) {
            store.stage.commitPath()
            return
          }

          // This will allow the user to adjust control points as soon as they place a path point,
          // but before they have lifted their mouse/pointer
          const mostRecentPointIdx = store.build.activePath.points.length - 1
          store.build.setActivePoint(`controlpoint--${store.build.activePath.id}--${mostRecentPointIdx}--0`)
        } else {
          // Only check pointer intersections if no tools are active
          store.rootContainer.checkPointerIntersections(pointerVector)
        }

        const { hoveredId, hoveredControl, hoveredPoint } = store.build
        if (hoveredId && hoveredId.includes('--handle--')) {
          // Shape Controls, convert hovering into active
          store.build.setActiveControl(hoveredId)
          const handleControlTool = hoveredControl && hoveredControl.replace('handle--', '').split('--')[0]
          store.build.setTool(handleControlTool)
        } else if (hoveredPoint) {
          // Path Controls, convert hovering into active
          if (hoveredPoint.startsWith('point--') && store.keyHeld.Alt) {
            const onePath = store.rootContainer.findItem(store.build.selectedIds[0])
            onePath.blastControlPoints(hoveredPoint)
          } else if (hoveredPoint.startsWith('controlpoint--') && store.keyHeld.Alt) {
            // Holding alt while moving a control point will detatch it from the other point
            const onePath = store.rootContainer.findItem(store.build.selectedIds[0])
            onePath.detatchControlPoints(hoveredPoint)
            store.build.setActivePoint(hoveredPoint)
          } else {
            store.build.setActivePoint(hoveredPoint)
          }
        } else if (hoveredId) {
          // Standard Click-to-Select, ignored when above interactions occur
          if (store.build.selectedIds.length === 0) {
            store.build.setSelected([hoveredId])
          } else if (store.build.selectedIds.includes(hoveredId) === false) {
            if (store.keyHeld.Meta || store.keyHeld.Shift) {
              store.build.addToSelection(hoveredId)
            } else {
              store.build.setSelected([hoveredId])
            }
          }

          if (hoveredControl === 'rotation') {
            store.build.setTool(store.tools.ROTATE)
          }
        } else {
          store.build.setSelected([])
        }

        /* START DRAG LOGIC */
        // Wait 50ms before starting a drag in case user has already let up on mouse
        // this prevents "micro movements" in an Item's position from just trying to
        // select it, but indicate the 'grab' hand immediatley for smoother UX
        store.build.indicatePreDrag(true)
        startDragInitialWaitTimeoutId.current = setTimeout(
          () => store.build.startDrag(pointerVector),
          50
        )
        store.selector.setPosition(pointerVector)
      } else if (event.target.id === 'playhead-canvas') {
        store.playhead.startDrag(pointerVectorRatioOne)
        store.playhead.setHovered(true)
        store.playhead.setHoverLineFrame(null)
        goToFrameWithPointerX(pointerVectorRatioOne.x)
      } else if (event.target.id.startsWith('keyframe-item--')) {
        store.keyframeEditor.startDrag(pointerVectorRatioOne.x)
      } else if (event.target.id === 'curve-editor-canvas') {
        const { handle1Intersection, handle2Intersection } = store.curveEditor
        if (handle1Intersection) {
          store.curveEditor.startDrag(pointerVector, 1)
        } else if (handle2Intersection) {
          store.curveEditor.startDrag(pointerVector, 2)
        }
      } else if (event.target.id.startsWith('left-menu-item')) {
        // Wait 300ms before starting a drag because of aforementioned "micro movements"
        // but mostly to make sure the user actually wants to drag this DOM element
        startDragLeftMenuInitialWaitTimeoutId.current = setTimeout(
          () => store.leftMenu.startDrag(pointerVectorRatioOne),
          300
        )
      }
    } else if (event.type === 'pointerup') {
      /* POINTER UP / END-OF-DRAG */
      if (event.button === 1) { store.keyHeld.setKey('MiddleMouse', false) }

      if (store.leftMenu.dragStart) {
        // This also stops the drag tracking for leftMenu
        // The difference below is that none of those trackers operate onPointerUp
        store.leftMenu.releaseDrag()
      }

      clearTimeout(startDragInitialWaitTimeoutId.current)
      clearTimeout(startDragLeftMenuInitialWaitTimeoutId.current)
      clearInterval(waitingToOpenContainerIntervalId.current)
      store.build.stopDrag()
      store.playhead.stopDrag()
      store.keyframeEditor.stopDrag()
      store.curveEditor.stopDrag()
      store.leftMenu.clearContainerToOpen()

      store.selector.setRect(0, 0)
      if (store.selector.hovers.length > 0) {
        store.build.setSelected(store.selector.hovers)
      }

      if ([store.tools.RESIZE, store.tools.ROTATE].includes(store.build.tool)) {
        store.build.setTool(store.tools.NONE)
      }

      store.build.setActiveControl(null)
      store.build.setActivePoint(null)

      store.selector.setHovers([])
    }
  }

  /* SCROLL HANDLER */
  // TODO [4]: Inertial Scroll on trackpad doesn't feel fast enough
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
