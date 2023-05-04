/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { action } from 'mobx'

import './App.css'
import useWindowSize from './hooks/useWindowSize'
import Rectangle from '../shapes/Rectangle'
import { isObject } from '../utility/object'
import Vector2 from '../structure/Vector2'

const DPR = window.devicePixelRatio || 1

const App = observer(({ store }) => {
  const parentEl = useRef(null)
  const canvasRef = useRef(null)
  const [windowWidth, windowHeight] = useWindowSize()

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
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    store.rootContainer.draw(ctx, canvas.width, canvas.height)
  }, [
    store.rootContainer,
    store.rootContainer.sortOrder,
    allObserverablePropertiesInTheTree,
    storeBuildProperties,
    windowWidth,
    windowHeight,
  ])
  /* End Main Loop */

  const handleDrag = action((event) => {
    const { selectedId, dragStart } = store.build
    if (!dragStart) return

    const pointerVector = new Vector2(event.clientX * DPR, event.clientY * DPR)
    const relativeMovement = Vector2.subtract(pointerVector, dragStart)

    if (selectedId) {
      // TODO: replace this with findChild() once we have an actual tree
      const selectedItem = store.rootContainer.children[selectedId]
      selectedItem.position.add(relativeMovement)
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
    if (event.type === 'pointerdown' && event.target === canvasRef.current) {
      store.setSelected(store.build.hoveredId)
      store.startDrag(pointerVector)
      parentEl.current.addEventListener('pointermove', handleDragMemoized)
    }
    if (event.type === 'pointerup') {
      parentEl.current.removeEventListener('pointermove', handleDragMemoized)
      store.stopDrag(pointerVector)
    }
  }

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

  return (
    <div
      ref={parentEl}
      onPointerMove={handlePointerEvent}
      onPointerDown={handlePointerEvent}
      onPointerUp={handlePointerEvent}
    >
      <div id="left-menu">
        <button type="button" onClick={addItem}>+ add item</button>
        <span style={{ marginTop: 4, marginBottom: 4 }}>{store.rootContainer.id.split('-')[0]}</span>
        <ul>
          {store.rootContainer.sortOrder.map((childId) => {
            const child = store.rootContainer.children[childId]
            const listItemClass = `left-menu-item ${store.build.selectedId === childId && 'left-menu-item-selected'}`
            const buttonClass = `temp-button ${store.build.selectedId === childId && 'temp-button-selected'}`
            return (
              <li
                key={childId}
                className={listItemClass}
                onClick={() => store.setSelected(childId)}
              >
                <span>{childId.split('-')[0]}</span>
                <span>
                  <button type="button" className={buttonClass} onClick={() => store.rootContainer.decreaseOrder(childId)}>↑</button>
                  <button type="button" className={buttonClass} onClick={() => store.rootContainer.increaseOrder(childId)}>↓</button>
                  <button type="button" className={buttonClass} onClick={() => child.delete()}>x</button>
                  <button type="button" className={buttonClass} onClick={() => doSomething(childId)}>&</button>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <canvas
        ref={canvasRef}
        width={windowWidth * DPR}
        height={windowHeight * DPR}
        id="stage"
        style={{ width: windowWidth, height: windowHeight }}
      />
    </div>
  )
})

export default App
