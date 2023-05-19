import { makeObservable, computed } from 'mobx'

import Shape from '../drawing/Shape'
import Alignment from '../structure/Alignment'

class Line extends Shape {
  constructor(...args) {
    super('line', ...args)

    this.alignment.x = Alignment.LEFT
    this.thickness = 10
    this.length = 400

    this.controllerType = 'Line'

    makeObservable(this, {
      length: computed,
      thickness: computed,
    })
  }

  get length() { return this.size.width }
  set length(value) { this.size.width = value }
  get thickness() { return this.size.height }
  set thickness(value) { this.size.height = value }

  drawShape() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)

    // dissalow stroke on line, as conceptually it ~is~ a stroke in and of itself
    // notice that we skip drawing it, regardless if its there
    // Reminder to remove it from property editor & keyframe editor
    this.shadow.prepare(this.ctx)
    this.fill.draw(this.ctx)
  }
}

export default Line
