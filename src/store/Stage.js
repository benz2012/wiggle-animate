import { makeObservable, observable, action, toJS } from 'mobx'

// TODO [1]: export the transparency values into save file

import Container from '../lib/structure/Container'
import Ellipse from '../lib/shapes/Ellipse'
import Line from '../lib/shapes/Line'
import Path from '../lib/shapes/Path'
import Polygon from '../lib/shapes/Polygon'
import Rectangle from '../lib/shapes/Rectangle'
import Text from '../lib/shapes/Text'
import Vector2 from '../lib/structure/Vector2'
import shapeTypeMap from '../lib/shapes/shapeTypeMap'

class Stage {
  static get TRANSPARENT_INDICATORS() {
    return {
      CHECKERBOARD_DARK: 'checkerboard-dark',
      CHECKERBOARD_LIGHT: 'checkerboard-light',
      BLACK: 'black',
    }
  }

  static get INITIAL() {
    return {
      transparent: false,
      transparentIndicator: Stage.TRANSPARENT_INDICATORS.CHECKERBOARD_DARK,
    }
  }

  constructor(store) {
    this.store = store

    this.transparent = Stage.INITIAL.transparent
    this.transparentIndicator = Stage.INITIAL.transparentIndicator

    makeObservable(this, {
      transparent: observable,
      transparentIndicator: observable,
      setTransparency: action,
      setTransparencyIndicator: action,
      addNewPath: action,
      commitPath: action,
    })
  }

  setTransparency(newValue) { this.transparent = newValue }
  setTransparencyIndicator(newValue) { this.transparentIndicator = newValue }

  addNewItem(newItem) {
    const highestSelectedItemId = this.store.build.highestSelectedItemId(this.store.rootContainer)
    if (highestSelectedItemId) {
      const { item, parent } = this.store.rootContainer.findItemAndParent(highestSelectedItemId)
      if (item instanceof Container) {
        item.add(newItem)
      } else {
        parent.add(newItem)
      }
    } else {
      this.store.rootContainer.add(newItem)
    }

    return newItem
  }

  addNewItemAndAction(newItem) {
    const { selectedIds } = this.store.build
    this.addNewItem(newItem)
    this.store.actionStack.push({
      perform: ['stage.addNewItemFromPureObject', [newItem.toPureObject(), toJS(selectedIds)]],
      revert: ['rootContainer.findAndDelete', [newItem.id]],
    })
  }

  addNewItemFromPureObject(pureObject, selectedAtTheTime) {
    const ItemType = pureObject.className === 'Container' ? Container : shapeTypeMap[pureObject.className]
    const newItem = new ItemType()
    newItem.fromPureObject(pureObject)

    this.store.build.setSelected(selectedAtTheTime)
    this.addNewItem(newItem)
  }

  canvasCenter() {
    const { width, height } = this.store.rootContainer.canvasSize
    return [width / 2, height / 2]
  }

  addContainer = () => {
    const newContainer = new Container()
    newContainer.setOrigin(new Vector2(...this.canvasCenter()))
    return this.addNewItemAndAction(newContainer)
  }

  addRectangle = () => {
    const [x, y] = this.canvasCenter()
    const newItem = new Rectangle(x, y)
    this.addNewItemAndAction(newItem)
  }

  addEllipse = () => this.addNewItemAndAction(new Ellipse(...this.canvasCenter()))
  addText = () => this.addNewItemAndAction(new Text(...this.canvasCenter()))
  addPolygon = () => this.addNewItemAndAction(new Polygon(...this.canvasCenter()))
  addLine = () => this.addNewItemAndAction(new Line(...this.canvasCenter()))

  addNewPath = () => {
    const newPath = new Path()
    this.addNewItem(newPath)
    this.store.build.activePath = newPath
    return newPath
  }

  commitPath() {
    let pathId
    const { activePath } = this.store.build
    if (activePath) {
      pathId = activePath.id
      activePath.commitPath()

      const pathParent = this.store.rootContainer.findParent(pathId)
      this.store.actionStack.push({
        perform: ['stage.addNewItemFromPureObject', [activePath.toPureObject(), [pathParent.id]]],
        revert: ['rootContainer.findAndDelete', [pathId]],
      })
    }

    this.store.build.tool = this.store.tools.NONE
    this.store.build.activePath = null
    this.store.build.pointerPosition = null
    if (pathId) {
      this.store.build.setSelected([pathId])
    }
  }

  toPureObject() {
    return {
      transparent: this.transparent,
      transparentIndicator: this.transparentIndicator,
    }
  }

  fromPureObject({ transparent, transparentIndicator }) {
    this.transparent = transparent
    this.transparentIndicator = transparentIndicator
  }
}

export default Stage
