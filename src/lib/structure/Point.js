import Vector2 from './Vector2'
import { observeListOfProperties } from '../../utility/state'

class Point extends Vector2 {
  static get className() { return 'Point' }
  static get BLAST_DISTANCE() { return 72 }

  constructor(x = 0, y = 0) {
    super(x, y)
    this.controlOut = new Vector2(x, y)
    this.controlIn = new Vector2(x, y)

  get controlPoints() {
    return [this.controlOut, this.controlIn]
  }

  movePointBy(relativeX, relativeY) {
    // const toMoveOffset = Vector2.subtract(this, new Vector2(newX, newY))
    this.x += relativeX
    this.y += relativeY
    this.controlOut.x += relativeX
    this.controlOut.y += relativeY
    this.controlIn.x += relativeX
    this.controlIn.y += relativeY
  }

  zeroOutControlPoints() {
    this.controlOut.x = this.x
    this.controlOut.y = this.y
    this.controlIn.x = this.x
    this.controlIn.y = this.y
  }

  blastOutControlPoints(blastAngle) {
    // Takes angle as Radians
    const blastPre = new Vector2(-Point.BLAST_DISTANCE, 0)
    blastPre.rotate(blastAngle)
    blastPre.add(this)
    const blastPost = new Vector2(Point.BLAST_DISTANCE, 0)
    blastPost.rotate(blastAngle)
    blastPost.add(this)

    this.controlOut = blastPre
    this.controlIn = blastPost
  }

  toString() {
    return `Point(${super.toString()}, ${this.controlIn}, ${this.controlOut})`
  }
}

export default Point
