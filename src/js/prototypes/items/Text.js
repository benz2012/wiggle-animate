import { observable, action } from 'mobx'

import AnimatableItem from '../AnimatableItem'

class Text extends AnimatableItem {
  // Canvas Size Relative Values (0-100)
  static get FONT_SIZE() { return 20 }

  static get OBSERVABLES() {
    return [...AnimatableItem.OBSERVABLES, 'fontSize']
  }

  @observable _content = 'Text Object'
  @observable _fontSize = Text.FONT_SIZE

  toJSON() {
    return ({
      ...super.toJSON(),
      content: this.content,
      fontSize: this.fontSize,
    })
  }

  get content() { return this._content }
  get fontSize() { return this._fontSize }

  set content(value) {
    this.item.content = value
    this._content = value
    this.resetPositionFromSizeChange()
  }

  set fontSize(value) {
    this.item.fontSize = this.absolute(value) / 5
    this._fontSize = value
    this.resetPositionFromSizeChange()
  }

  @action resetPositionFromSizeChange() {
    const { x, y } = this.position
    this.position = { x, y }
    this.canvas.draw()
  }

  onCreate(itemProps) {
    new this.paper.PointText({
      ...itemProps,
      content: this.content,
    })
    this.fontSize = this.fontSize // placed here to eliminate duplicate logic
    this.resetPositionFromSizeChange()
  }
}

export default Text
