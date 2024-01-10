import { makeObservable, action } from 'mobx'

import Container from '../lib/structure/Container'
import Ellipse from '../lib/shapes/Ellipse'
import Line from '../lib/shapes/Line'
import Path from '../lib/shapes/Path'
import Polygon from '../lib/shapes/Polygon'
import Rectangle from '../lib/shapes/Rectangle'
import Text from '../lib/shapes/Text'
import Vector2 from '../lib/structure/Vector2'

class Stage {
  constructor(store) {
    this.store = store

    makeObservable(this, {
      addNewPath: action,
      commitPath: action,
    })
  }

  addNewItem(newItem) {
    const { selectedIds } = this.store.build
    const found = this.store.rootContainer.findItemAndParent(selectedIds[0])
    const selectedItem = found?.item
    if (selectedItem instanceof Container) {
      selectedItem.add(newItem)
    } else if (selectedItem) {
      found.parent.add(newItem)
    } else {
      this.store.rootContainer.add(newItem)
    }
    // TODO [-]: remove this after debugging
    window._item = newItem
    return newItem
  }

  canvasCenter() {
    const { width, height } = this.store.rootContainer.canvasSize
    return [width / 2, height / 2]
  }

  addContainer = () => {
    const newContainer = new Container()
    newContainer.setOrigin(new Vector2(...this.canvasCenter()))
    return this.addNewItem(newContainer)
  }

  addRectangle = () => this.addNewItem(new Rectangle(...this.canvasCenter()))
  addEllipse = () => this.addNewItem(new Ellipse(...this.canvasCenter()))
  addText = () => this.addNewItem(new Text(...this.canvasCenter()))
  addPolygon = () => this.addNewItem(new Polygon(...this.canvasCenter()))
  addLine = () => this.addNewItem(new Line(...this.canvasCenter()))

  addNewPath = () => {
    const newPath = new Path()
    this.addNewItem(newPath)
    this.store.build.activePath = newPath
    return newPath
  }

  commitPath() {
    let pathId
    if (this.store.build.activePath) {
      pathId = this.store.build.activePath.id
      this.store.build.activePath.commitPath()
    }
    this.store.build.tool = this.store.tools.NONE
    this.store.build.activePath = null
    this.store.build.pointerPosition = null
    if (pathId) {
      this.store.build.setSelected([pathId])
    }
  }
}

export default Stage
