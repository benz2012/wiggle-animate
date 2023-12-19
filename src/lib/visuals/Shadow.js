// Stroke and Shadow have all sorts of messed up interactions that need fixing
// not sure there is a solution actually unless we draw the stroke twice, since I can't draw the shadow manually
// Would need to be: Stroke+Shadow -> Fill+Shadow -> Stroke w/no shadow
// This will get even more complicated when we change the stroke drawing order to account for stroke.flow
// maybe we should design our own shadow module that we control the drawing of

// Oh, and apparently fill.opacity affect shadow.opacity as well, just another reason
// could use https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
// but it's not supported in Safari sadly

// Safari is complaining that they don't like the filter API and want to paired with layers somehow
// so until that gets resolved, the only way to blur part of your canvas would be to:
//   convert it to an image, blur that image, write it back to the canvas
// for now I plan to just disable the field on safari

// Also when you make this shadow module, you should add a Spread Property which will basically
// just scale the original object in either x or y before generating the shadow itself

// The buildin shadow module gets offset & rotation wrong, but I don't think we'll have problems
// since we're using the actual shape itself to generate it

class Shadow {
  /**
   * Applies a drop shadow effect to the drawing. (Similar to css-filter drop-shadow)
   * A drop shadow is effectively a blurred, offset version of the drawing's alpha mask
   * drawn in a particular color, composited below the drawing.
   *
   * Inputs are Color (with alpha), Offset X & Y, Spread X & Y and Blur Radius
   * The Spread property comes from CSS Box Shadow concept, but in this context
   * acts relativley instead of absolute pixel amounts. This allows us to use the scale
   * property on the initial object before capturing it's alpha channel.
   */
}

export default Shadow
