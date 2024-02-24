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
import SaveDialog from './Modal/SaveDialog'
import SettingsDialog from './Modal/Settings'
import ExportDialog from './Modal/Export'
import FontDialog from './Modal/FontDialog'
import HelpDialog from './Modal/HelpDialog'
import HoldingSnackbar from './Modal/HoldingSnackbar'
import useWindowSize from './hooks/useWindowSize'
import { peekAtObservables } from '../utility/tree'
import { rotateArrowCursor } from '../utility/drawing'

const App = observer(({ store }) => {
  const stageRef = useRef(null)
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
    // TODO [3]: peel this into a hook
    //           also, get rid of the abstraction, simply set the cursor name directly in the store
    switch (store.view.currentAction) {
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
      case 'pointing':
      case 'addingPathPoints':
        // TODO [4]: Add a custom pen-pointer with plus mark
        stageRef.current.style.cursor = 'default'
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
      case 'rotate':
        stageRef.current.style.cursor = `${rotateArrowCursor}, pointer`
        break
      default:
        stageRef.current.style.cursor = 'crosshair'
        break
    }
  }, [store.view.currentAction])

  /* Main observations */
  const allObserverablePropertiesInTheTree = JSON.stringify(
    Object.values(store.rootContainer.children).map(peekAtObservables)
  )

  /* Main drawing trigger */
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    if (store.output.isExporting) return
    const canvasEl = stageRef.current
    const ctx = canvasEl.getContext('2d')
    store.rootContainer.draw(ctx, canvasEl.width, canvasEl.height)
  }, [
    store.rootContainer.sortOrder,
    store.rootContainer.canvasSize.width,
    store.rootContainer.canvasSize.height,
    store.rootContainer.canvasPosition.x,
    store.rootContainer.canvasPosition.y,
    store.rootContainer.canvasScale,
    `${store.rootContainer.canvasFill}`,
    store.stage.transparent,
    store.stage.transparentIndicator,
    store.output.isExporting,
    store.keyHeld.Space,
    store.keyHeld.MiddleMouse,
    store.build.tool,
    store.build.activePath,
    store.build.pointerPosition,
    store.build.selectedIds,
    store.build.hoveredId,
    store.build.hoveredControl,
    store.build.hoveredPoint,
    store.build.activePoint,
    store.selector.rect.area,
    store.selector.hovers,
    store.project.numFontsLoaded,
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
        <LeftMenu store={store} windowHeight={windowHeight} />
        <BottomMenu store={store} windowWidth={windowWidth} />
        <Stage
          ref={stageRef}
          width={windowWidth}
          height={windowHeight}
          devicePixelRatio={store.DPR}
        />
        {store.output.isExporting && (
          <canvas
            id="export-canvas"
            style={{ visibility: 'hidden' }}
            width={store.rootContainer.canvasSize.width}
            height={store.rootContainer.canvasSize.height}
          />
        )}
      </PointerHandler>

      {/* Dialog Handling */}
      <SettingsDialog
        store={store}
        open={store.view.dialogs.settings}
        onClose={() => store.view.closeDialog('settings')}
      />
      <SaveDialog
        store={store}
        open={store.view.dialogs.save}
        onClose={() => store.view.closeDialog('save')}
      />
      <ExportDialog
        store={store}
        open={store.view.dialogs.export}
        onClose={() => store.view.closeDialog('export')}
      />
      <FontDialog
        store={store}
        open={store.view.dialogs.addFonts}
        onClose={() => store.view.closeDialog('addFonts')}
      />
      <HelpDialog
        open={store.view.dialogs.help}
        onClose={() => store.view.closeDialog('help')}
      />

      {/* Snackbars */}
      <HoldingSnackbar
        reasons={[
          store.project.fontsAreLoading,
        ]}
        messages={[
          'Loading Fonts',
        ]}
      />

      {/* Other */}
      <textarea id="hidden-textarea" style={{ opacity: 0 }} />
    </>
  )
})

export default App
