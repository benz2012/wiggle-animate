import { makeObservable, action } from 'mobx'
import Container from './Container'
import Item from './Item'

class RootContainer extends Container {
  constructor(store) {
    super()
    this.store = store
    Item.rootContainer = this
    this.transform = new DOMMatrix([1, 0, 0, 1, 0, 0])

    makeObservable(this, { checkPointerIntersections: action })
  }

  draw(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx

    this.ctx.setTransform(this.transform)
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    super.draw(
      this.transform,
      this.store.build.hoveredId,
      this.store.build.selectedId,
    )
  }

  checkPointerIntersections(pointerVector) {
    const hovered = super.checkPointerIntersections(pointerVector, this.transform)
    this.store.build.hoveredId = hovered
    if (hovered != null) {
      document.body.style.cursor = 'move'
    } else {
      document.body.style.cursor = 'default'
    }
  }
}

export default RootContainer
