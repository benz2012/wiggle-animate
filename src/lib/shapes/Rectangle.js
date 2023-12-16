import VisibleShape from '../drawing/VisibleShape'

class Rectangle extends VisibleShape {
  static get className() { return 'Rectangle' }
  // TODO [4]: add corner radius property
  // this will get complicated with stroke. maybe rounded rect as separarate object?

  constructor(...args) {
    super('rectangle', ...args)
  }

  drawShape() {
    this.ctx.beginPath()
    this.ctx.rect(...this.rectSpec)

    this.prepareShadow()
    this.drawStroke()
    this.drawFill()

    // TODO [2]: Stroke and Shadow have all sorts of messed up interactions that need fixing
    // not sure there is a solution actually unless we draw the stroke twice, since I can't draw the shadow manually
    // Would need to be: Stroke+Shadow -> Fill+Shadow -> Stroke w/no shadow
    // This will get even more complicated when we change the stroke drawing order to account for stroke.flow
    // maybe we should design our own shadow module that we control the drawing of
    // Oh, and apparently fill.opacity affect shadow.opacity as well, just another reason
    // could use https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
    // but it's not supported in Safari sadly
    // Also when you make this shadow module, you should add a Spread Property which will basically
    // just scale the original object in either x or y before generating the shadow itself
  }
}

export default Rectangle
