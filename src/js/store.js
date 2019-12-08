import { observable, reaction, autorun } from 'mobx'
import paper from 'paper'

import Project from './prototypes/Project'
import Canvas from './prototypes/Canvas'
import Animation from './prototypes/Animation'
import ModeStore from './prototypes/ModeStore'
import ToolsStore from './prototypes/ToolsStore'
import GalleryStore from './prototypes/GalleryStore'

import observeAnimatableTree from './util/observeAnimatableTree'
import { storageEnabled } from './util/storage'

class RootStore {
  @observable project
  @observable canvas
  @observable animation
  @observable mode
  @observable tools
  @observable gallery

  constructor() {
    this.paper = new paper.PaperScope()

    this.project = new Project(this)
    this.canvas = new Canvas(this)
    this.animation = new Animation()
    this.mode = new ModeStore()
    this.tools = new ToolsStore()
    this.gallery = new GalleryStore()

    // Auto Save & Auto Load
    const { pathname } = window.location
    const pathArray = pathname.split('/')

    if (
      storageEnabled() &&
      (pathArray.length > 1 && pathArray[1] !== 'gallery')
    ) {
      const projectObj = localStorage.getItem('micrograph.project')
      if (projectObj) {
        setTimeout(() => {
          this.project.load(projectObj)
        }, 100)
      }

      autorun(() => {
        const projectAsJSON = this.project.save()
        localStorage.setItem('micrograph.project', projectAsJSON)
      }, { delay: 300 })
    }

    // Reacts to all changes made to animatable item properties and redraws the canvas
    reaction(
      () => ([
        this.animation.now,
        this.canvas.color,
        Object.values(this.canvas.animatables).map(observeAnimatableTree),
      ]),
      () => this.canvas.draw()
    )
  }

  reset = () => {
    this.project.initialize()
    this.canvas.initialize()
    this.animation.initialize()
    this.mode.initialize()
    this.tools.initialize()
  }
}

export default RootStore
