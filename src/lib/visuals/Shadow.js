const BLUR_SAFE_OVERFLOW = 200

// TODO [3]: memozie the shadow image on only re-draw it when size/stroke/alignement/shadow params change

class Shadow {
  /**
   * Applies a drop shadow effect to the drawing.
   *
   * A drop shadow is effectively a blurred, offset version of the drawing's alpha mask
   * drawn in a particular color, composited below the drawing.
   *
   * This class exists because CanvasRenderingContext2D Shadows lack features, operate in strange ways
   * with respect to scaling & rotation, are directly tied to the alpha set on an objects fill
   * (conceptually that's how a shadow works, but we don't like that implementation),
   * and have very strange interactions with strokes.
   */

  constructor(sourceShape) {
    this.shape = sourceShape
  }

  draw() {
    const [shapeX, shapeY, shapeWidth, shapeHeight] = this.shape.rectSpec
    const { strokeWidth, shadowBlur, shadowColor, shadowOpacity, shadowOffset, shadowSpread } = this.shape

    const shadowDrawWidth = (shapeWidth + strokeWidth + shadowSpread) + (shadowBlur * 4) + BLUR_SAFE_OVERFLOW
    const shadowDrawHeight = (shapeHeight + strokeWidth + shadowSpread) + (shadowBlur * 4) + BLUR_SAFE_OVERFLOW

    const offscreenCanvas = new OffscreenCanvas(shadowDrawWidth, shadowDrawHeight)
    const offscreenCtx = offscreenCanvas.getContext('2d')

    // This allows us to call the shapes native methods and have it draw itself
    // without the shape realizing it's actually drawing to our OffscreenCanvas
    // instead of the default Stage canvas
    const stageCtx = this.shape.ctx
    this.shape.ctx = offscreenCtx

    // Draw the shadow in the center of the offscreen canvas, in the space
    // that we've prepared for the shadow to consume. We will apply
    // the offset parameter when we draw it back to the Stage
    const whereToDrawX = (shadowDrawWidth / 2) + (-1 * (shapeX + (shapeWidth / 2)))
    const whereToDrawY = (shadowDrawHeight / 2) + (-1 * (shapeY + (shapeHeight / 2)))
    offscreenCtx.translate(whereToDrawX, whereToDrawY)

    // CanvasRenderingContext2D.filter is not supported in Safari, due to software design disagreements
    // Until this is resolved, the only way to blur part of your canvas would be to:
    // convert it to an image, blur that image, write it back to the canvas.
    // For now, I plan to just disable the field on Safari
    offscreenCtx.filter = `blur(${shadowBlur}px)`

    // Draw the source Shape, including it's stroke, using color and opacity from the shadow properties
    this.shape.drawPath()
    this.shape.drawFill({
      overrideColor: shadowColor,
      overrideOpacity: this.shape.fillOpacity === 0 ? 0 : shadowOpacity,
    })
    this.shape.drawStroke({
      overrideColor: shadowColor,
      overrideOpacity: this.shape.strokeOpacity === 0 ? 0 : shadowOpacity,
      overrideWidth: this.shape.strokeWidth + shadowSpread,
    })

    // Resets
    offscreenCtx.filter = 'none'
    this.shape.ctx = stageCtx

    // Transpose the shadow back onto the Stage
    const placeShadowX = (-1 * whereToDrawX) + shadowOffset.x
    const placeShadowY = (-1 * whereToDrawY) + shadowOffset.y
    stageCtx.drawImage(offscreenCanvas, placeShadowX, placeShadowY)
  }
}

export default Shadow
