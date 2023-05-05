/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { action } from 'mobx'

import './App.css'
import Stage from './Stage'
import useWindowSize from './hooks/useWindowSize'
import Rectangle from '../shapes/Rectangle'
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

  /* Main observation & drawing trigger */
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
  const storeBuildProperties = JSON.stringify(Object.entries(store.build))
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
    allObserverablePropertiesInTheTree,
    storeBuildProperties,
    windowWidth,
    windowHeight,
  ])
  /* End Main Loop */

  /* Interaction Event Handlers */
  const handleDrag = action((event) => {
    const { selectedId, dragStart } = store.build
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
    } else if (selectedId) {
      const selectedItem = store.rootContainer.findItem(selectedId)
      selectedItem.position.add(relativeMovementScaledToCanvas)
    }

    // this will enable us to track distance moved since the last event
    store.startDrag(pointerVector)
  })
  const handleDragMemoized = useCallback(handleDrag, [handleDrag])

  const handlePointerEvent = (event) => {
    const pointerVector = new Vector2(event.clientX * DPR, event.clientY * DPR)
    if (event.type === 'pointermove') {
      if (!store.build.dragStart) {
        store.rootContainer.checkPointerIntersections(pointerVector)
      }
    }
    if (event.type === 'pointerdown' && event.target === stageRef.current) {
      store.rootContainer.checkPointerIntersections(pointerVector)
      store.setSelected(store.build.hoveredId)
      store.startDrag(pointerVector)
    }
    if (event.type === 'pointerup') {
      store.stopDrag(pointerVector)
    }
  }

  // Key Listener
  const handleKeyDownEvent = action((event) => {
    switch (event.key) {
      case ' ':
        event.preventDefault()
        store.setIsMoveable(true)
        store.setSelected(null)
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
      default:
        break
    }
  })
  const handleKeyDownEventMemoized = useCallback(handleKeyDownEvent, [handleKeyDownEvent])
  const handleKeyUpEvent = action((event) => {
    const { selectedId } = store.build

    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        if (selectedId) {
          const itemToDelete = store.rootContainer.findItem(selectedId)
          store.setSelected(null)
          store.setHovered(null)
          itemToDelete.delete()
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
  const addItem = () => {
    const newItem = new Rectangle(
      store.rootContainer.canvasSize.width / 2,
      store.rootContainer.canvasSize.height / 2,
    )
    store.rootContainer.add(newItem)
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
      <div id="left-menu">
        <button
          type="button"
          className="noselect general-button left-menu-action-button mb-8"
          onClick={addItem}
        >
          + add item
        </button>
        <div style={{ flexGrow: 1 }}>
          {store.rootContainer.sortOrder.map((childId) => {
            const child = store.rootContainer.children[childId]
            const listItemClass = `left-menu-item ${store.build.selectedId === childId && 'left-menu-item-selected'}`
            const buttonClass = `noselect general-button ml-4 ${store.build.selectedId === childId && 'general-button-selected'}`
            return (
              <li
                key={childId}
                className={listItemClass}
                onClick={() => store.setSelected(childId)}
              >
                <span className="noselect" style={{ lineHeight: '14px', fontSize: '14px' }}>{child.name}</span>
              </li>
            )
          })}
        </div>
        <div id="left-menu-action-bottom">
          <button
            type="button"
            className="noselect general-button left-menu-action-button"
            onClick={() => { store.rootContainer.decrementScale() }}
          >
            -
          </button>
          <span className="noselect percentage-text">
            {Math.trunc(store.rootContainer.canvasScale * 100)}%
          </span>
          <button
            type="button"
            className="noselect general-button left-menu-action-button"
            onClick={() => { store.rootContainer.incrementScale() }}
          >
            +
          </button>
          <button
            type="button"
            className="noselect general-button left-menu-action-button"
            onClick={resetView}
          >
            ⟲
          </button>
        </div>
      </div>
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
