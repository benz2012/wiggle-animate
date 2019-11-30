import { observable, action } from 'mobx'
import paper from 'paper'

import Animation from './Animation'

import { downloadJSON } from '../util/download'

class Project {
  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @observable name = 'My Animation'
  @observable inputItems
  @observable inputBuilt = false

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

  load = (event) => {
    const { files } = event.target
    const { canvas, animation } = this.rootStore
    const targetFile = files[0]

    const reader = new FileReader()

    reader.onload = () => {
      const input = JSON.parse(reader.result)

      this.setName(targetFile.name.replace(/\.[^/.]+$/, ''))

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

      this.rootStore.mode.set('BUILD')
    }

    reader.readAsText(targetFile)
  }

  save = () => {
    /* eslint no-param-reassign: 0 */
    const { canvas, animation } = this.rootStore

    const jsonOutput = JSON.stringify({
      animation: animation.toJSON(),
      canvas: canvas.toJSON(),
    })
    downloadJSON(jsonOutput, this.name)
  }

  publish = () => {
    console.log('publishing project')
  }

  // render() {
  //   // render canvas animation to frames
  // }
}

export default Project
