import VisibleShape from '../drawing/VisibleShape'

class Rectangle extends VisibleShape {
  static get className() { return 'Rectangle' }
  // TODO: add corner radius property
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

    // NOTE: The below comment no longer applies with stroke.flow being 'outside' by default,
    //       but it will apply for 'middle' and 'inside'
    // TODO: Stroke's shadow draws out of order
    // not sure there is a solution actually unless we draw the stroke twice, since I can't draw the shadow manually
    // Would need to be: Stroke+Shadow -> Fill+Shadow -> Stroke w/no shadow
    // This will get even more complicated when we change the stroke drawing order to account for stroke.flow
    // maybe we should design our own shadow module that we control the drawing of
    // Oh, and apparently fill.opacity affect shadow.opacity as well, just another reason
    // could use https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
    // but it's not supported in Safari sadly
  }
}

export default Rectangle
