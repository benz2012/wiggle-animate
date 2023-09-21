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
  const exportCanvasRef = useRef(null)
  const [windowWidth, windowHeight] = useWindowSize()

  /* State Syncs */
  useEffect(() => {
    /* Initial Autofocus of the Stage */
    if (stageRef.current) {
      stageRef.current.focus()
    }
  }, [])
  useEffect(() => {
    /* Pointer Cursor Styles */
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
      case 'addingPathPoints':
        stageRef.current.style.cursor = 'none'
        break
      case 'ew-resize':
        stageRef.current.style.cursor = 'ew-resize'
        break
      case 'ns-resize':
        stageRef.current.style.cursor = 'ns-resize'
        break
      case 'nesw-resize':
        stageRef.current.style.cursor = 'nesw-resize'
        break
      case 'nwse-resize':
        stageRef.current.style.cursor = 'nwse-resize'
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
    let canvasEl = stageRef.current
    let drawFunc = 'draw'
    if (store.project.isExporting) {
      canvasEl = exportCanvasRef.current
      drawFunc = 'drawForExport'
    }
    const ctx = canvasEl.getContext('2d')
    store.rootContainer[drawFunc](ctx, canvasEl.width, canvasEl.height)
  }, [
    store.rootContainer.sortOrder,
    store.rootContainer.canvasSize.width,
    store.rootContainer.canvasSize.height,
    store.rootContainer.canvasPosition.x,
    store.rootContainer.canvasPosition.y,
    store.rootContainer.canvasScale,
    store.rootContainer.canvasFill.color,
    store.project.isExporting,
    store.keyHeld.Space,
    store.keyHeld.MiddleMouse,
    store.build.tool,
    store.build.activePath,
    store.build.pointerPosition,
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
        {store.project.isExporting && (
          <canvas
            ref={exportCanvasRef}
            id="export-canvas"
            style={{ visibility: 'hidden' }}
            width={store.rootContainer.canvasSize.width}
            height={store.rootContainer.canvasSize.height}
          />
        )}
      </PointerHandler>
    </>
  )
})

export default App
