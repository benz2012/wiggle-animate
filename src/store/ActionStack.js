import { makeAutoObservable } from 'mobx'

class ActionStack {
  constructor(store) {
    this.store = store

    this.undoStack = []
    this.redoStack = []

    makeAutoObservable(this)
  }

  get canUndo() { return this.undoStack.length > 0 }
  get canRedo() { return this.redoStack.length > 0 }

  push(event) {
    /* Event should look like the following:
    {
      perform: ['reference.toFunction', [functionArg1, functionArg2, ...]],
      revert: ['reference.toFunction', [functionArg1, functionArg2, ...]],
      redoPushToUndo: true|false, (Normally False, since `perform` will push itself onto undoStack)
    }

    `reference` starts from the RootStore instance, so `rootContainer.someMember`, NOT `store.rootContainer...`
    */
    this.undoStack.push(event)
  }

  getFunctionFromPath(functionPath) {
    let functionOwner = this.store
    let functionReference = this.store
    const pathSegments = functionPath.split('.')
    pathSegments.forEach((pathSegment, index) => {
      if (index < pathSegments.length - 1) {
        functionOwner = functionOwner[pathSegment]
      }
      functionReference = functionReference[pathSegment]
    })

    functionReference = functionReference.bind(functionOwner)
    return functionReference
  }

  undo() {
    const mostRecentAction = this.undoStack.pop()
    const [functionPath, args] = mostRecentAction.revert
    const functionReference = this.getFunctionFromPath(functionPath)
    functionReference(...args)

    this.redoStack.push(mostRecentAction)
  }

  redo() {
    const mostRecentUndo = this.redoStack.pop()
    const [functionPath, args] = mostRecentUndo.perform
    const functionReference = this.getFunctionFromPath(functionPath)
    functionReference(...args)
    if (mostRecentUndo.redoPushToUndo) {
      this.undoStack.push(mostRecentUndo)
    }
  }
}

export default ActionStack
