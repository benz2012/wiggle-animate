import { observable, reaction } from 'mobx'

import Project from './prototypes/Project'
import Canvas from './prototypes/Canvas'
import Animation from './prototypes/Animation'
import ModeStore from './prototypes/ModeStore'

class RootStore {
  @observable project
  @observable canvas
  @observable animation
  @observable mode

  constructor() {
    this.project = new Project(this)
    this.canvas = new Canvas(this)
    this.animation = new Animation()
    this.mode = new ModeStore()

    // Reacts to all changes made to animatable item properties and redraws the canvas
    reaction(
      () => ([
        this.animation.now,
        this.canvas.color,
        Object.values(this.canvas.animatables).map(animatable => (
          Object.keys(animatable).map(key => animatable[key])
        )),
      ]),
      () => this.canvas.draw()
    )
  }
}

export default RootStore
