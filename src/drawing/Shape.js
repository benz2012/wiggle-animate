import Animatable from './Animatable'
import Color from '../visuals/Color'
import Fill from '../visuals/Fill'
import Stroke from '../visuals/Stroke'
import Shadow from '../visuals/Shadow'
import { observeListOfProperties } from '../utility/state'

class Shape extends Animatable {
  constructor() {
    super()
    this.fill = new Fill(Color.randomPastel())
    this.stroke = new Stroke()
    this.shadow = new Shadow()

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, 'fill', 'stroke', 'shadow']
    this._nestedObservables = [...super.nestedObservables, 'fill', 'stroke', 'shadow']
    observeListOfProperties(this, this.observables, inheritedObservables)
  }
}

export default Shape
