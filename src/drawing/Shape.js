import Animatable from './Animatable'
import Size from '../structure/Size'
import Color from '../visuals/Color'
import Fill from '../visuals/Fill'
import Stroke from '../visuals/Stroke'
import Shadow from '../visuals/Shadow'
import { observeListOfProperties } from '../utility/state'

class Shape extends Animatable {
  constructor(x = 0, y = 0, width = 100, height = 100) {
    super(x, y)
    this.size = new Size(width, height)

    this.fill = new Fill(Color.randomPastel())
    this.stroke = new Stroke()
    this.shadow = new Shadow()

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'size', 'fill', 'stroke', 'shadow']
    this._nestedObservables = [...super.nestedObservables, 'size', 'fill', 'stroke', 'shadow']
    observeListOfProperties(this, this.observables, inheritedObservables)
  }

  get width() { return this.size.width }
  set width(value) { this.size.width = value }
  get height() { return this.size.height }
  set height(value) { this.size.height = value }
}

export default Shape
