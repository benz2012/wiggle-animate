import { observable, action } from 'mobx'
import paper from 'paper'

class Canvas {
  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @observable width
  @observable height
  @observable _color = '#000000'
  @observable background
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
    this.background = new paper.Path.Rectangle({
      topLeft: [0, 0],
      bottomRight: [paper.view.element.width, paper.view.element.height],
      fillColor: this.color,
    })
    this.draw(this.rootStore.animation.firstFrame)
  }

  get color() { return this._color }
  set color(value) {
    this._color = value
    this.background.fillColor = value
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

    this.draw()
  }

  @action remove = (animatable) => {
    animatable.item.off('mousedown', this.handleItemMouseDown)
    animatable.item.remove()

    const clone = { ...this.animatables }
    delete clone[animatable.key]
    this.animatables = clone
    this.draw()
  }

  @action setTool = (nextTool) => {
    const prevTool = this.tool

    const entering = toolId => (prevTool !== toolId && nextTool === toolId)
    const exiting = toolId => (prevTool === toolId && nextTool !== toolId)

    if (entering('SELECT')) { this.selectOn() }
    if (exiting('SELECT')) { this.selectOff() }

    if (entering('SETTINGS')) { this.rootStore.mode.settings = true }
    if (exiting('SETTINGS')) { this.rootStore.mode.settings = false }

    // Finally, set the tool in-memory
    this.tool = nextTool
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

  forEachAnimatable = callback => (
    Object.values(this.animatables).forEach(callback)
  )

  build = () => {
    this.forEachAnimatable((animatable) => { animatable.create(this) })
    this.draw()
  }

  draw = (frame) => {
    const frameToDraw = frame || this.rootStore.animation.now
    this.forEachAnimatable((animatable) => { animatable.draw(frameToDraw) })
    if (paper.view) paper.view.update()
  }

  selectOn = () => {
    this.forEachAnimatable((animatable) => {
      animatable.item.on('mousedown', this.handleItemMouseDown)
    })
    paper.view.on('mousedown', this.handleViewMouseDown)
  }

  selectOff = () => {
    this.forEachAnimatable((animatable) => {
      animatable.item.off('mousedown', this.handleItemMouseDown)
    })
    paper.view.off('mousedown', this.handleViewMouseDown)
    this.deselect()
  }
}

export default Canvas
