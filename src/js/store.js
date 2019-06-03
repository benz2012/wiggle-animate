import Project from './prototypes/Project'
import Canvas from './prototypes/Canvas'
import Animation from './prototypes/Animation'
import ModeStore from './prototypes/ModeStore'

class RootStore {
  constructor() {
    this.project = new Project(this)
    this.canvas = new Canvas(this)
    this.animation = new Animation(this)
    this.mode = new ModeStore(this)
  }
}

export default RootStore
