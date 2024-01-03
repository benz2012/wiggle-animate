import { makeAutoObservable } from 'mobx'

class View {
  constructor(store) {
    this.store = store

    this.dialogs = {
      help: false,
      export: false,
      addFonts: false,
    }

    makeAutoObservable(this)
  }

  openDialog(dialogName) {
    if (dialogName === 'export') {
      this.store.output.setFileName()
    }
    this.dialogs[dialogName] = true
  }

  closeDialog(dialogName) {
    // Prevent closing the dialog until export is finished
    if (dialogName === 'export' && this.store.output.isExporting) return

    this.dialogs[dialogName] = false
  }

  closeAllDialogs() {
    Object.keys(this.dialogs).forEach((dialogName) => {
      this.closeDialog(dialogName)
    })
  }

  reset() {
    this.store.rootContainer.setCanvasToBestFit()
  }

  get currentAction() {
    const {
      preDrag,
      dragStart,
      hoveredId,
      hoveredControl,
      hoveredPoint,
      activePoint,
      tool,
      selectedIds,
    } = this.store.build

    if (this.store.keyHeld.Space || this.store.keyHeld.MiddleMouse) {
      if (preDrag || dragStart) {
        return 'dragging'
      }
      return 'readyToMoveView'
    }

    if (tool === this.store.tools.PATH) {
      return 'addingPathPoints'
    }

    if (hoveredPoint || activePoint) {
      return 'pointing'
    }

    if (hoveredId) {
      let controlAction = null
      if (hoveredControl && hoveredControl.startsWith('handle')) {
        controlAction = hoveredControl.split('--').pop()
      }

      if (hoveredControl === 'rotation') {
        // this is just for containers
        return 'rotate'
      }

      if (selectedIds.length > 0) {
        if (preDrag || dragStart) {
          if (controlAction) return controlAction
          return 'dragging'
        }
        if (this.store.keyHeld.Meta || this.store.keyHeld.Shift) {
          return 'adding'
        }

        if (controlAction) return controlAction
      }

      return 'hovering'
    }

    if (this.store.keyHeld.Meta || this.store.keyHeld.Shift) {
      if (selectedIds.length > 0) {
        return 'adding'
      }
    }

    return null
  }
}

export default View
