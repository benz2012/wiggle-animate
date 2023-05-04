import { observable, autorun, makeObservable, action } from 'mobx'

import RootContainer from './structure/RootContainer'
import { storageEnabled } from './utility/storage'

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
    this.rootContainer.position.x = 500
    this.rootContainer.position.y = 200

    this.build = {
      tool: '',
      selectedId: null,
      hoveredId: null,
      dragStart: null,
    }

    makeObservable(this, {
      rootContainer: observable,
      build: observable,
      setSelected: action,
      startDrag: action,
      stopDrag: action,
    })
  }

  setSelected(value) { this.build.selectedId = value }
  startDrag(vector) { this.build.dragStart = vector }
  stopDrag() { this.build.dragStart = null }
}

export default RootStore
