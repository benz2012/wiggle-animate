import { useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import './App.css'
import Stage from './Stage'
import TopMenu from './TopMenu'
import LeftMenu from './LeftMenu'
import BottomMenu from './BottomMenu'
import PropertyEditor from './PropertyEditor'
import KeyHandler from './KeyHandler'
import PointerHandler from './PointerHandler'
import useWindowSize from './hooks/useWindowSize'
import { peekAtObservables, peekAtKeyframes } from '../utility/tree'

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
      case 'adding':
        stageRef.current.style.cursor = 'copy'
        break
      default:
        stageRef.current.style.cursor = 'crosshair'
        break
    }
  }, [store.determineCurrentAction])

  /* Main observations */
  const allObserverablePropertiesInTheTree = JSON.stringify(
    Object.values(store.rootContainer.children).map(peekAtObservables)
  )
  const allKeyframedPropertiesInTheTree = JSON.stringify(
    Object.values(store.rootContainer.children).map(peekAtKeyframes)
  )

  /* Animation Updater */
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    store.rootContainer.updatePropertiesForFrame(store.animation.now)
  }, [
    store.animation.now,
    allKeyframedPropertiesInTheTree,
  ])

  /* Main drawing trigger */
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    const stage = stageRef.current
    const ctx = stage.getContext('2d')
    store.rootContainer.draw(ctx, stage.width, stage.height)
  }, [
    store.rootContainer.sortOrder,
    store.rootContainer.canvasSize.width,
    store.rootContainer.canvasSize.height,
    store.rootContainer.canvasPosition.x,
    store.rootContainer.canvasPosition.y,
    store.rootContainer.canvasScale,
    store.rootContainer.canvasFill.color,
    store.build.selectedIds,
    store.build.hoveredId,
    store.build.hoveredControl,
    store.selector.rect.area,
    store.selector.hovers,
    allObserverablePropertiesInTheTree,
    windowWidth,
    windowHeight,
  ])

  return (
    <>
      <PropertyEditor store={store} />
      <KeyHandler store={store} />
      <PointerHandler store={store} ref={stageRef}>
        <TopMenu store={store} />
        <LeftMenu
          store={store}
          incrementScale={() => store.rootContainer.incrementScale()}
          decrementScale={() => store.rootContainer.decrementScale()}
        />
        <BottomMenu store={store} windowWidth={windowWidth} />
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
