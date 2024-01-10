import Vector2 from './Vector2'
import { observeListOfProperties } from '../../utility/state'

class Point extends Vector2 {
  static get className() { return 'Point' }
  static get CONTROL_POINT_NAMES() { return ['controlOut', 'controlIn'] }
  static get BLAST_DISTANCE() { return 72 }

  constructor(x = 0, y = 0) {
    super(x, y)
    this.controlOut = new Vector2(x, y)
    this.controlIn = new Vector2(x, y)
    this.controlsCollinear = true

    observeListOfProperties(this, ['controlOut', 'controlIn', 'controlsCollinear'])
  }

  get controlPoints() {
    return Point.CONTROL_POINT_NAMES.map((name) => this[name])
  }

  movePointBy(relativeX, relativeY) {
    this.x += relativeX
    this.y += relativeY
    this.controlOut.x += relativeX
    this.controlOut.y += relativeY
    this.controlIn.x += relativeX
    this.controlIn.y += relativeY
  }

  moveControlPointBy(controlPointName, relativeX, relativeY) {
    this[controlPointName].x += relativeX
    this[controlPointName].y += relativeY

    if (!this.controlsCollinear) return

    const pairedPointName = Point.CONTROL_POINT_NAMES.find((name) => name !== controlPointName)
    this[pairedPointName].x -= relativeX
    this[pairedPointName].y -= relativeY
  }

  zeroOutControlPoints() {
    this.controlOut.x = this.x
    this.controlOut.y = this.y
    this.controlIn.x = this.x
    this.controlIn.y = this.y
    this.controlsCollinear = true
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
    return `${Point.className}(${super.toString()}, ${this.controlIn}, ${this.controlOut}, ${this.controlsCollinear})`
  }

  toPureObject() {
    return {
      ...super.toPureObject(),
      className: Point.className,
      controlOut: this.controlOut.toPureObject(),
      controlIn: this.controlIn.toPureObject(),
      controlsCollinear: this.controlsCollinear,
    }
  }

  static fromPureObject({ x, y, controlOut, controlIn, controlsCollinear }) {
    const newPoint = new Point(x, y)
    newPoint.controlOut = Vector2.fromPureObject(controlOut)
    newPoint.controlIn = Vector2.fromPureObject(controlIn)
    newPoint.controlsCollinear = controlsCollinear
    return newPoint
  }
}

export default Point
