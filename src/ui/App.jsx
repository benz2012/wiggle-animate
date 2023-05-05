/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
import { useRef, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { action } from 'mobx'

import './App.css'
import Stage from './Stage'
import LeftMenu from './LeftMenu'
import useWindowSize from './hooks/useWindowSize'
import Rectangle from '../shapes/Rectangle'
import Container from '../structure/Container'
import Vector2 from '../structure/Vector2'
import { isObject } from '../utility/object'

const DPR = window.devicePixelRatio || 1

const App = observer(({ store }) => {
  const parentEl = useRef(null)
  const stageRef = useRef(null)
  const [windowWidth, windowHeight] = useWindowSize()

  /* State Syncs */
  useEffect(() => {
    switch (store.determineCurrentAction) {
      case 'dragging':
        stageRef.current.style.cursor = 'grabbing'
        break
      case 'hovering':
      case 'readyToMoveView':
        stageRef.current.style.cursor = 'grab'
        break
      default:
        stageRef.current.style.cursor = 'crosshair'
        break
    }
  }, [store.determineCurrentAction])
  /* End State Syncs */

  /* Main observations */
  const peekAtObservables = (item) => {
    let propsToLookAt = item.observables
    const hasNested = isObject(item) && 'nestedObservables' in item
    if (hasNested) {
      propsToLookAt = propsToLookAt.filter((prop) => (
        item.nestedObservables.includes(prop) === false
      ))
    }
    const peeked = propsToLookAt.map((property) => item[property])
    if (isObject(item) && 'nestedObservables' in item) {
      peeked.push(
        ...item.nestedObservables.map((property) => peekAtObservables(item[property]))
      )
    }
    return peeked
  }
  const allObserverablePropertiesInTheTree = JSON.stringify(
    Object.values(store.rootContainer.children).map(peekAtObservables)
  )
  /* Main drawing trigger */
  useEffect(() => {
    const stage = stageRef.current
    const ctx = stage.getContext('2d')
    store.rootContainer.draw(ctx, stage.width, stage.height)
  }, [
    store.rootContainer,
    store.rootContainer.sortOrder,
    store.rootContainer.canvasSize.width,
    store.rootContainer.canvasSize.height,
    store.rootContainer.canvasPosition.x,
    store.rootContainer.canvasPosition.y,
    store.rootContainer.canvasScale,
    store.rootContainer.canvasFill.color,
    store.build.selectedIds,
    store.build.hoveredId,
    store.selector.rect.area,
    store.selector.hovers,
    allObserverablePropertiesInTheTree,
    windowWidth,
    windowHeight,
  ])
  /* End Main Loop */

  /* Interaction Event Handlers */
  const handleDrag = action((event) => {
    const { selectedIds, dragStart } = store.build
    if (!dragStart) return

    const pointerVector = new Vector2(event.clientX * DPR, event.clientY * DPR)
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
    const pointerVector = new Vector2(event.clientX * DPR, event.clientY * DPR)
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

  // Key Listener
  const handleKeyDownEvent = action((event) => {
    switch (event.key) {
      case ' ':
        event.preventDefault()
        store.setIsMoveable(true)
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
      default:
        break
    }
  })
  const handleKeyDownEventMemoized = useCallback(handleKeyDownEvent, [handleKeyDownEvent])
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
        store.setIsMoveable(false)
        break
      case 'f':
        resetView()
        break
      default:
        break
    }
  })
  const handleKeyUpEventMemoized = useCallback(handleKeyUpEvent, [handleKeyUpEvent])
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownEventMemoized)
    window.addEventListener('keyup', handleKeyUpEventMemoized)
    window.addEventListener('pointermove', handleDragMemoized)
    return () => {
      window.removeEventListener('keydown', handleKeyDownEventMemoized)
      window.removeEventListener('keyup', handleKeyUpEventMemoized)
      window.removeEventListener('pointermove', handleDragMemoized)
    }
  }, [
    handleKeyDownEventMemoized,
    handleKeyUpEventMemoized,
    handleDragMemoized,
  ])
  /* End Interaction Event Handlers */

  /* Complex Actions */
  const addNewItem = (newItem) => {
    const { selectedIds } = store.build
    const found = store.rootContainer.findItemAndParent(selectedIds[0])
    const selectedItem = found?.item
    if (selectedItem instanceof Container) {
      selectedItem.add(newItem)
    } else if (selectedItem) {
      found.parent.add(newItem)
    } else {
      store.rootContainer.add(newItem)
    }
  }

  const addContainer = () => {
    addNewItem(new Container())
  }

  const addRect = () => {
    addNewItem(new Rectangle(
      store.rootContainer.canvasSize.width / 2,
      store.rootContainer.canvasSize.height / 2,
    ))
  }

  const resetView = action(() => {
    store.rootContainer.canvasScale = 1
    store.rootContainer.canvasPosition.x = 0
    store.rootContainer.canvasPosition.y = 0
  })
  /* End Complex Actions */

  return (
    <div
      ref={parentEl}
      onPointerMove={handlePointerEvent}
      onPointerDown={handlePointerEvent}
      onPointerUp={handlePointerEvent}
    >
      <LeftMenu
        store={store}
        addRect={addRect}
        addContainer={addContainer}
        incrementScale={() => store.rootContainer.incrementScale()}
        decrementScale={() => store.rootContainer.decrementScale()}
        resetView={resetView}
      />
      <Stage
        ref={stageRef}
        width={windowWidth}
        height={windowHeight}
        devicePixelRatio={DPR}
      />
    </div>
  )
})

export default App
