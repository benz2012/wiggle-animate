import { makeObservable, action, observable } from 'mobx'

import Shape from '../drawing/Shape'
import { observeListOfProperties } from '../../utility/state'

class Text extends Shape {
  constructor(...args) {
    super('text', ...args)

    this.text = this.name
    this.fontSize = 100
    this.font = 'sans-serif'
    // TODO: alignment modes other than center misrepresent bounding box
    this.align = 'center'
    this.direction = 'ltr'

    // I don't think we should allow baseline to be changed because it messes with how we
    // draw shapes, with the expectation that drawing always happens from the position x & y
    this.baseline = 'middle'

    this.middleToTop = 0

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'text', 'fontSize', 'font', 'align', 'direction']
    observeListOfProperties(this, this.observables, inheritedObservables)
    makeObservable(this, { measureAndSetSize: action })

    this.keyframes = {
      ...this.keyframes,
      text: observable([]),
      fontSize: observable([]),
    }
  }

  updatePropertiesForFrame(frame) {
    super.updatePropertiesForFrame(frame)
    this.text = this.valueForFrame(frame, 'text')
    this.fontSize = this.valueForFrame(frame, 'fontSize')
  }

  measureAndSetSize() {
    const metrics = this.ctx.measureText(this.text)
    this.width = metrics.width
    this.height = metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent
    this.middleToTop = metrics.fontBoundingBoxAscent
  }

  drawShape() {
    this.ctx.font = `${this.fontSize}px ${this.font}`
    this.ctx.textAlign = this.align
    this.ctx.textBaseline = this.baseline
    this.ctx.direction = this.direction
    this.measureAndSetSize()

    // Since the browser doesn't draw "middle" in the true middle, offset the drawing
    // so that the text boundaries align 1:1 with the bounding box that we plan to
    // draw based on position with width & height
    this.ctx.translate(0, this.middleToTop - (this.height / 2))

    this.ctx.beginPath()

    this.shadow.prepare(this.ctx)
    this.fill.prepare(this.ctx)
    this.ctx.fillText(this.text, 0, 0)
    this.stroke.prepare(this.ctx)
    this.ctx.strokeText(this.text, 0, 0)
  }
}

export default Text
