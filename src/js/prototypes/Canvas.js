import { observable, action } from 'mobx'
import paper from 'paper'

class Canvas {
  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @observable width
  @observable height
  @observable animatables = {}
  @observable tool
  @observable selected

  setSize(width, height) {
    // allows the canvas element one tick to recognize size changes
    const setSizeAction = action(() => {
      this.height = height
      this.width = width
    })
    setTimeout(setSizeAction, 1)
  }

  attatchTo = (id) => {
    const element = document.getElementById(id)
    paper.setup(element)
  }

  init() {
    paper.view.autoUpdate = false
    // black background
    new paper.Path.Rectangle({
      topLeft: [0, 0],
      bottomRight: [paper.view.element.width, paper.view.element.height],
      fillColor: 'black',
    })
    this.draw(this.rootStore.animation.firstFrame)
  }

  @action add = (animatable) => {
    animatable.create(this)
    this.animatables = {
      ...this.animatables,
      [animatable.key]: animatable,
    }

    if (this.tool === 'SELECT') {
      this.addListenersAndSelect(animatable)
    }

    this.draw(this.rootStore.animation.now)
  }

  @action remove = (animatable) => {
    animatable.item.off('mousedown', this.handleItemMouseDown)
    animatable.item.remove()

    const clone = { ...this.animatables }
    delete clone[animatable.key]
    this.animatables = clone
    this.draw(this.rootStore.animation.now)
  }

  @action setTool = (tool) => {
    this.tool = tool
    if (tool === 'SELECT') {
      this.selectOn()
    } else {
      this.selectOff()
    }
  }

  @action select = (item) => {
    this.deselect()
    item.selected = true // eslint-disable-line no-param-reassign
    this.selected = this.animatables[item.name]
    paper.view.update()
  }

  @action deselect = () => {
    if (this.selected) {
      this.selected.item.selected = false
      this.selected = undefined
    }
    paper.view.update()
  }

  addListenersAndSelect = (animatable) => {
    animatable.item.on('mousedown', this.handleItemMouseDown)
    this.select(animatable.item)
  }

  handleItemMouseDown = (event) => {
    event.stopPropagation()
    this.select(event.currentTarget)
  }

  handleViewMouseDown = (event) => {
    event.stopPropagation()
    this.deselect()
  }

  build = () => {
    Object.values(this.animatables).forEach((animatable) => {
      animatable.create(this)
    })
    this.draw(this.rootStore.animation.now)
  }

  draw = (frame) => {
    Object.values(this.animatables).forEach((animatable) => {
      animatable.draw(frame)
    })
    paper.view.update()
  }

  selectOn = () => {
    Object.values(this.animatables).forEach((animatable) => {
      animatable.item.on('mousedown', this.handleItemMouseDown)
    })
    paper.view.on('mousedown', this.handleViewMouseDown)
  }

  selectOff = () => {
    Object.values(this.animatables).forEach((animatable) => {
      animatable.item.off('mousedown', this.handleItemMouseDown)
    })
    paper.view.off('mousedown', this.handleViewMouseDown)
    this.deselect()
  }
}

export default Canvas
