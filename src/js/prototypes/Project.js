import { observable, action } from 'mobx'
import paper from 'paper'

import Animation from './Animation'

class Project {
  constructor(rootStore) {
    // FIXME: remove reference to rootStore
    this.rootStore = rootStore
    this.setName('My Animation')
  }

  @observable name = ''

  @action setName(name) {
    this.name = name
  }

  clear = () => {
    paper.project.clear()
    paper.project.remove()

    const { canvas, animation } = this.rootStore
    canvas.setSize(undefined, undefined)
    animation.setIn(Animation.FIRST)
    animation.setOut(animation.frames)
  }

  // load() {
  //   // load project file
  // }

  // save() {
  //   // save project file
  // }

  // render() {
  //   // render canvas animation to frames
  // }
}

export default Project
