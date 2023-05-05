import { observable, autorun, makeObservable, action, computed } from 'mobx'

import RootContainer from './structure/RootContainer'
import { storageEnabled } from './utility/storage'
import Vector2 from './structure/Vector2'
import Size from './structure/Size'

class RootStore {
  constructor() {
    // this.project = new Project(this)
    // this.canvas = new Canvas(this)
    // this.animation = new Animation()

    // Auto Save & Auto Load
    // if (storageEnabled()) {
    //   const projectObj = localStorage.getItem('micrograph.project')
    //   if (projectObj) {
    //     setTimeout(() => {
    //       this.project.load(projectObj)
    //     }, 100)
    //   }

    //   autorun(() => {
    //     const projectAsJSON = this.project.save()
    //     localStorage.setItem('micrograph.project', projectAsJSON)
    //   }, { delay: 300 })
    // }

    this.rootContainer = new RootContainer(this)

    this.build = {
      tool: '',
      selectedId: null,
      hoveredId: null,
      dragStart: null,
    }

    this.selector = {
      rect: new Size(0, 0),
      position: new Vector2(0, 0),
      hovers: [],
    }

    this.view = { isMoveable: false }

    makeObservable(this, {
      rootContainer: observable,
      build: observable,
      selector: observable,
      view: observable,
      setIsMoveable: action,
      setHovered: action,
      setSelected: action,
      startDrag: action,
      stopDrag: action,
      setSelectorPosition: action,
      setSelectorRect: action,
      setSelectorHovers: action,
      determineCurrentAction: computed,
    })
  }

  get determineCurrentAction() {
    if (this.view.isMoveable) {
      if (this.build.dragStart) {
        return 'dragging'
      }
      return 'readyToMoveView'
    }

    if (this.build.hoveredId) {
      if (this.build.selectedId) {
        if (this.build.dragStart) {
          return 'dragging'
        }
      }
      return 'hovering'
    }

    return null
  }

  /* Build Actions */
  setHovered(value) { this.build.hoveredId = value }
  setSelected(value) { this.build.selectedId = value }
  startDrag(vector) { this.build.dragStart = vector }
  stopDrag() { this.build.dragStart = null }

  setSelectorPosition(vector) {
    this.selector.position.x = vector.x
    this.selector.position.y = vector.y
  }

  setSelectorRect(width, height) {
    this.selector.rect.width = width
    this.selector.rect.height = height
  }

  setSelectorHovers(values) { this.selector.hovers = values }

  /* View Actions */
  setIsMoveable(value) { this.view.isMoveable = value }
}

export default RootStore
