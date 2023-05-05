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
import { isObject } from '../utility/object'
import Vector2 from '../structure/Vector2'

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
      relativeMovement.y / store.rootContainer.canvasScale
    )

    if (selectedId) {
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
      store.rootContainer.checkPointerIntersections(pointerVector)
    }
    if (event.type === 'pointerdown' && event.target === stageRef.current) {
      store.rootContainer.checkPointerIntersections(pointerVector)
      store.setSelected(store.build.hoveredId)
      store.startDrag(pointerVector)
      parentEl.current.addEventListener('pointermove', handleDragMemoized)
    }
    if (event.type === 'pointerup') {
      parentEl.current.removeEventListener('pointermove', handleDragMemoized)
      store.stopDrag(pointerVector)
    }
  }

  // Key Listener
  const handleKeyEvent = action((event) => {
    const { selectedId } = store.build

    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        if (selectedId) {
          store.setSelected(null)
          store.setHovered(null)
          const itemToDelete = store.rootContainer.findItem(selectedId)
          itemToDelete.delete()
        }
        break

      default:
        break
    }
  })
  const handleKeyEventMemoized = useCallback(
    handleKeyEvent,
    [handleKeyEvent, store.build.selectedId]
  )
  useEffect(() => {
    window.addEventListener('keyup', handleKeyEventMemoized)
    return () => window.removeEventListener('keyup', handleKeyEventMemoized)
  }, [handleKeyEventMemoized])
  /* End Interaction Event Handlers */

  /* Complex Actions */
  const addItem = () => {
    const newItem = new Rectangle()
    store.rootContainer.add(newItem)
  }

  const doSomething = action((itemId) => {
    const choose = (choices) => {
      const index = Math.floor(Math.random() * choices.length)
      return choices[index]
    }
    const propToMove = choose(['x', 'x', 'y'])
    const distanceToMove = choose([-150, -100, -50, 50, 100, 150])
    const propToChange = choose(['width', 'height'])
    const sizeToChange = choose([-20, -15, -10, -5, 5, 10, 15, 20])

    const item = store.rootContainer.children[itemId]
    item.position[propToMove] += distanceToMove
    item.fill.color.alpha = (Math.random() * 0.8) + 0.2
    item.rotation.degrees = (Math.random() * 45)
    item[propToChange] += sizeToChange
    // item.rotation.degrees += 15
    // item.scale[propToMove] += 0.1
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
        <button type="button" onClick={addItem} style={{ marginBottom: 8 }} className="noselect">+ add item</button>
        {store.rootContainer.sortOrder.map((childId) => {
          const child = store.rootContainer.children[childId]
          const listItemClass = `left-menu-item ${store.build.selectedId === childId && 'left-menu-item-selected'}`
          const buttonClass = `noselect temp-button ${store.build.selectedId === childId && 'temp-button-selected'}`
          return (
            <li
              key={childId}
              className={listItemClass}
              onClick={() => store.setSelected(childId)}
            >
              <span className="noselect">{childId.split('-')[0]}</span>
              <span>
                <button type="button" className={buttonClass} onClick={() => store.rootContainer.decreaseOrder(childId)}>↑</button>
                <button type="button" className={buttonClass} onClick={() => store.rootContainer.increaseOrder(childId)}>↓</button>
                <button type="button" className={buttonClass} onClick={() => child.delete()}>x</button>
                <button type="button" className={buttonClass} onClick={() => doSomething(childId)}>&</button>
              </span>
            </li>
          )
        })}
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
