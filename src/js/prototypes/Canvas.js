import { observable, action } from 'mobx'

class Canvas {
  @observable width
  @observable height
  @observable _color
  @observable background
  @observable animatables
  @observable tool
  @observable selected

  constructor(rootStore) {
    this.rootStore = rootStore
    this.paper = rootStore.paper
    this.initialize()
  }

  initialize() {
    let prevWidth
    let prevHeight
    if (this.width !== undefined) {
      prevWidth = this.width
      prevHeight = this.height
    }

    this.width = undefined
    this.height = undefined
    this._color = '#000000'
    this.animatables = {}
    this.tool = undefined
    this.selected = undefined

    if (prevWidth !== undefined) {
      this.setSize(prevWidth, prevHeight)
    }
  }

  toJSON() {
    return ({
      color: this.color,
      animatables: Object.entries(this.animatables).reduce((output, [key, animatable]) => {
        output[key] = animatable.toJSON() // eslint-disable-line
        return output
      }, {}),
    })
  }

  setSize(width, height) {
    // allows the canvas element one tick to recognize size changes
    const setSizeAction = action(() => {
      this.height = height
      this.width = width
    })
    setTimeout(setSizeAction, 1)
  }

  attatchAndSetup = (id) => {
    const element = document.getElementById(id)
    this.paper.setup(element)
    this.paper.view.autoUpdate = false
    this.background = new this.paper.Path.Rectangle({
      topLeft: [0, 0],
      bottomRight: [this.paper.view.element.width, this.paper.view.element.height],
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
    animatable.item.off('mousedrag', this.handleItemMouseDrag)
    animatable.item.off('mouseup', this.handleItemMouseUp)
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

    if (entering('CLEAR')) { this.rootStore.mode.clear = true }
    if (exiting('CLEAR')) { this.rootStore.mode.clear = false }

    // Finally, set the tool in-memory
    this.tool = nextTool
  }

  @action select = (item) => {
    this.deselect()
    item.selected = true // eslint-disable-line no-param-reassign
    this.selected = this.animatables[item.name]
    this.paper.view.update()
  }

  @action deselect = () => {
    if (this.selected) {
      this.selected.item.selected = false
      this.selected = undefined
    }
    this.paper.view.update()
  }

  addListenersAndSelect = (animatable) => {
    animatable.item.on('mousedown', this.handleItemMouseDown)
    animatable.item.on('mousedrag', this.handleItemMouseDrag)
    animatable.item.on('mouseup', this.handleItemMouseUp)
    this.select(animatable.item)
  }

  handleItemMouseDown = (event) => {
    event.stopPropagation()
    this.select(event.currentTarget)
  }

  handleItemMouseDrag = (event) => {
    event.stopPropagation()
    const item = event.currentTarget
    const animatable = this.animatables[item.name]
    const { now } = this.rootStore.animation
    const nextPosition = {
      x: animatable.relative(item.position.x + event.delta.x),
      y: animatable.relative(item.position.y + event.delta.y, 'height'),
    }
    animatable.setPropertyAtTime('x', nextPosition.x, now)
    animatable.setPropertyAtTime('y', nextPosition.y, now)
  }

  handleItemMouseUp = (event) => {
    event.stopPropagation()
    const item = event.currentTarget
    const animatable = this.animatables[item.name]
    const { now } = this.rootStore.animation
    const nextPosition = {
      x: Math.round(animatable.x),
      y: Math.round(animatable.y),
    }
    animatable.setPropertyAtTime('x', nextPosition.x, now)
    animatable.setPropertyAtTime('y', nextPosition.y, now)
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
    if (this.paper.view) this.paper.view.update()
  }

  selectOn = () => {
    this.forEachAnimatable((animatable) => {
      animatable.item.on('mousedown', this.handleItemMouseDown)
      animatable.item.on('mousedrag', this.handleItemMouseDrag)
      animatable.item.on('mouseup', this.handleItemMouseUp)
    })
    this.paper.view.on('mousedown', this.handleViewMouseDown)
  }

  selectOff = () => {
    this.forEachAnimatable((animatable) => {
      animatable.item.off('mousedown', this.handleItemMouseDown)
      animatable.item.off('mousedrag', this.handleItemMouseDrag)
      animatable.item.off('mouseup', this.handleItemMouseUp)
    })
    this.paper.view.off('mousedown', this.handleViewMouseDown)
    this.deselect()
  }
}

export default Canvas
