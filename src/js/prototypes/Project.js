import { observable, action } from 'mobx'

import Animation from './Animation'
import { downloadJSON } from '../util/download'

class Project {
  @observable name
  @observable inputItems
  @observable inputBuilt

  constructor(rootStore) {
    this.rootStore = rootStore
    this.paper = rootStore.paper
    this.initialize()
  }

  initialize() {
    if (this.paper.project) {
      this.paper.project.clear()
      this.paper.project.remove()
    }
    this.name = 'My Animation'
    this.inputItems = undefined
    this.inputBuilt = false
  }

  toJSON() {
    return ({
      name: this.name,
    })
  }

  @action setName(name) {
    this.name = name
  }

  clear = () => {
    this.paper.project.clear()
    this.paper.project.remove()

    const { canvas, animation } = this.rootStore
    canvas.setSize(undefined, undefined)
    animation.setIn(Animation.FIRST)
    animation.setOut(animation.frames)
  }

  load = (inputJSON, fileName, callback) => {
    const { canvas, animation } = this.rootStore
    const input = JSON.parse(inputJSON)

    const name = fileName || input.project.name
    this.setName(name.replace(/\.[^/.]+$/, ''))

    Object.keys(input.animation).forEach((key) => {
      animation[key] = input.animation[key]
    })

    Object.keys(input.canvas).forEach((key) => {
      if (key === 'animatables') {
        this.inputItems = input.canvas.animatables
      } else {
        canvas[key] = input.canvas[key]
      }
    })

    if (callback) callback()
  }

  loadFromFile = (event, callback) => {
    const { files } = event.target
    const targetFile = files[0]
    const reader = new FileReader()
    reader.onload = () => this.load(reader.result, targetFile.name, callback)

    this.rootStore.reset()
    reader.readAsText(targetFile)
  }

  save = () => {
    /* eslint no-param-reassign: 0 */
    const { canvas, animation } = this.rootStore
    const projectAsJSON = JSON.stringify({
      project: this.toJSON(),
      animation: animation.toJSON(),
      canvas: canvas.toJSON(),
    })
    return projectAsJSON
  }

  download = (object) => {
    downloadJSON(object, this.name)
  }

  publish = () => {
    const projectAsJSON = this.save()
    this.rootStore.gallery.clipsRef.push().set(projectAsJSON)
  }

  // render() {
  //   // render canvas animation to frames
  // }
}

export default Project
