import { useRef, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'

import './App.css'
import Stage from './Stage'
import LeftMenu from './LeftMenu'
import KeyHandler from './KeyHandler'
import PointerHandler from './PointerHandler'
import useWindowSize from './hooks/useWindowSize'
import { isObject } from '../utility/object'

const App = observer(({ store }) => {
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

  // Key Handler State
  const [shiftKeyHeld, setShiftKeyHeld] = useState(false)
  const [metaKeyHeld, setMetaKeyHeld] = useState(false)
  const keyHeldSetterMap = {
    Shift: setShiftKeyHeld,
    Meta: setMetaKeyHeld,
  }
  const setKeyHeld = (key, state) => {
    keyHeldSetterMap[key](state)
  }

  return (
    <>
      <KeyHandler store={store} setKeyHeld={setKeyHeld} />
      <PointerHandler store={store} ref={stageRef}>
        <LeftMenu
          store={store}
          incrementScale={() => store.rootContainer.incrementScale()}
          decrementScale={() => store.rootContainer.decrementScale()}
          shiftKeyHeld={shiftKeyHeld}
          metaKeyHeld={metaKeyHeld}
        />
        <Stage
          ref={stageRef}
          width={windowWidth}
          height={windowHeight}
          devicePixelRatio={store.DPR}
        />
      </PointerHandler>
    </>
  )
})

export default App
