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
    }

    `reference` starts from the RootStore instance, so `rootContainer.someMember`, NOT `store.rootContainer...`

    Push(...) should never be called from one of the functions referenced in perform/revert,
    as that causes confusion over when a brand new event is pushed, versus an event simply being replayed.
    Failing to do this will pre-maturley clear the entire redoStack from calling redo once.
    */
    this.undoStack.push(event)

    // Any new action creates a timeline branch. The simplest solution to this time paradox is to
    // empty the redo stack -- removing access to the previous forward-timeline.
    // Undos from before this point will still be kept, as they are unrelated to the branch.
    // More elegant idea here: https://github.com/zaboople/klonk/blob/master/TheGURQ.md
    this.redoStack = []
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

    this.undoStack.push(mostRecentUndo)
  }
}

export default ActionStack
