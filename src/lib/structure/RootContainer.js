import { makeObservable, action, observable } from 'mobx'

import Container from './Container'
import Item from './Item'
import Size from './Size'
import Alignment from './Alignment'
import Fill from '../visuals/Fill'
import Vector2 from './Vector2'
import { identityMatrix } from '../../utility/matrix'
import { drawStageDots, drawSelector, drawPotentialPathPoint } from '../../utility/drawing'

const scaleSteps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5]

class RootContainer extends Container {
  constructor(store) {
    super()
    this.store = store
    Item.rootContainer = this

    // non-observable, just for local reference
    this.rootWidth = window.innerWidth * this.DPR
    this.rootHeight = window.innerHeight * this.DPR

    this.canvasPosition = new Vector2(0, 0)
    this._canvasScale = 1
    // TODO: make these customizable
    this.canvasSize = new Size(1920, 1080)
    this.canvasFill = new Fill({ r: 0, g: 0, b: 0 })
    this.setCanvasToBestFit()

    // adjust inherited properties
    this.position.isKeyframable = false
    this.origin.isKeyframable = false
    this.rotation.isKeyframable = false
    this.scale.isKeyframable = false

    makeObservable(this, {
      canvasSize: observable,
      canvasPosition: observable,
      _canvasScale: observable,
      canvasFill: observable,
      checkPointerIntersections: action,
      findRectIntersections: action,
      changeScaleByStep: action,
    })
  }

  get canvasScale() { return this._canvasScale }
  set canvasScale(value) {
    if (value == null) return
    const scaleLowerBound = scaleSteps[0]
    const scaleUpperBound = scaleSteps[scaleSteps.length - 1]

    // Trim to 2 Sig Figs, compress at bounds
    let finalValue = Math.round((value + Number.EPSILON) * 100) / 100
    if (value < scaleLowerBound) {
      finalValue = scaleLowerBound
    } else if (value > scaleUpperBound) {
      finalValue = scaleUpperBound
    }

    const ratioBetweenScales = (finalValue / this._canvasScale)
    this._canvasScale = finalValue

    // this keeps the canvas "centered" when scaling
    // TODO: the center actually needs to align with the offset from BestFit
    //       this is complicated because it begs the question, will the user be working
    //       in the center of the screen or in the center of the "screen minus left menu"
    // TODO: if scaling with mousewheel, we should reposition towards the mouse, not the "center"
    this.canvasPosition.x *= (ratioBetweenScales ** 2)
    this.canvasPosition.y *= (ratioBetweenScales ** 2)
  }

  setCanvasToBestFit() {
    if (!this.rootWidth || !this.rootHeight) return

    const leftMenuSizeInCanvasPixels = 216 * this.DPR
    // the extra 16 pixels is just for some padding/wiggle room
    const spaceToWorkWith = this.rootWidth - leftMenuSizeInCanvasPixels - 16
    const existingRatio = spaceToWorkWith / this.canvasSize.width
    let bestScale
    scaleSteps.some((scaleStep) => {
      if (scaleStep > existingRatio) return true
      bestScale = scaleStep
      if (scaleStep === 1) return true
      return false
    })

    this._canvasScale = bestScale
    this.canvasPosition.x = (leftMenuSizeInCanvasPixels / 2) * bestScale
    this.canvasPosition.y = 0
  }

  changeScaleByStep(direction = 1) {
    let stepsWithCurrentScale
    if (scaleSteps.includes(this._canvasScale)) {
      stepsWithCurrentScale = [...scaleSteps]
    } else {
      stepsWithCurrentScale = [...scaleSteps, this._canvasScale]
    }
    stepsWithCurrentScale.sort()
    const currentIndex = stepsWithCurrentScale.findIndex((scale) => scale === this._canvasScale)
    this.canvasScale = stepsWithCurrentScale[currentIndex + direction]
  }

  incrementScale() { this.changeScaleByStep() }
  decrementScale() { this.changeScaleByStep(-1) }

  get canvasTopLeft() {
    return [
      (this.rootWidth / 2)
        - ((this.canvasSize.width / 2) * this.canvasScale)
        + (this.canvasPosition.x / this.canvasScale),
      (this.rootHeight / 2)
      - ((this.canvasSize.height / 2) * this.canvasScale)
      + (this.canvasPosition.y / this.canvasScale),
    ]
  }

  get allItems() {
    // remove root container id from list
    return super.allItems.slice(1)
  }

  findItem(itemId) {
    const result = this.findItemAndParent(itemId)
    if (result) return result.item
    return null
  }

  findParent(itemId) {
    const result = this.findItemAndParent(itemId)
    if (result) return result.parent
    return null
  }

  draw(ctx, rootWidth, rootHeight) {
    if (!rootWidth || !rootHeight) return

    this.ctx = ctx
    this.rootWidth = rootWidth
    this.rootHeight = rootHeight

    this.ctx.setTransform(identityMatrix())
    this.ctx.clearRect(0, 0, rootWidth, rootHeight)

    this.parentTransform = identityMatrix()
      .translateSelf(...this.canvasTopLeft)
      .scaleSelf(this.canvasScale, this.canvasScale)

    this.drawStageDots(rootWidth, rootHeight)
    this.drawCanvas()

    super.draw(
      this.parentTransform,
      this.store.build.hoveredId,
      this.store.build.hoveredControl,
      this.store.build.selectedIds,
      this.store.selector.hovers,
    )

    this.drawPotentialPathPoint()

    this.drawSelector()
  }

  drawForExport(ctx, rootWidth, rootHeight) {
    if (!rootWidth || !rootHeight) return

    this.ctx = ctx
    this.rootWidth = rootWidth
    this.rootHeight = rootHeight

    this.ctx.setTransform(identityMatrix())
    this.ctx.clearRect(0, 0, rootWidth, rootHeight)
    this.parentTransform = identityMatrix()

    this.drawCanvas()
    super.draw(this.parentTransform, null, null, [], [])
  }

  drawStageDots(rootWidth, rootHeight) {
    if (this.DPR > 1 && this.canvasScale < 0.4) return
    if (this.canvasScale < 0.25) return

    this.ctx.setTransform(this.currentTransform)
    this.ctx.translate(this.canvasSize.width / 2, this.canvasSize.height / 2)

    drawStageDots(this.ctx, rootWidth, rootHeight, this.canvasPosition, this.canvasScale)
  }

  drawCanvas() {
    this.ctx.setTransform(this.currentTransform)
    this.ctx.beginPath()
    this.ctx.rect(0, 0, ...this.canvasSize.values)
    this.canvasFill.draw(this.ctx)
  }

  drawPotentialPathPoint() {
    if (this.store.build.tool !== this.store.tools.PATH) return
    if (!this.store.build.pointerPosition) return
    if (this.store.keyHeld.Space || this.store.keyHeld.MiddleMouse) return

    const pointerInCanvasSpace = DOMMatrix
      .fromMatrix(this.currentTransform)
      .invertSelf()
      .translateSelf(...this.store.build.pointerPosition.values)
    this.ctx.setTransform(this.currentTransform)
    this.ctx.translate(pointerInCanvasSpace.e, pointerInCanvasSpace.f)

    const { color } = this.canvasFill
    const brighterCanvas = ((color.red + color.green + color.blue) / 3) > 145
    drawPotentialPathPoint(this.ctx, brighterCanvas)
  }

  drawSelector() {
    const { selector } = this.store
    if (selector.rect.area === 0) return

    this.ctx.setTransform(identityMatrix())
    drawSelector(this.ctx, selector, this.DPR)
  }

  checkPointerIntersections(pointerVector) {
    const foundIntersection = super.checkPointerIntersections(pointerVector)
    if (!foundIntersection) {
      this.store.setHovered(null)
      this.store.setHoveredControl(null)
    }
  }

  moveAllSelectedByIncrement(relativeMovement, fromArrowKey = false) {
    this.store.build.selectedIds.forEach((selectedId) => {
      const relativeMovementScaledToCanvas = Vector2.multiply(
        relativeMovement,
        new Vector2(1 / this.canvasScale, 1 / this.canvasScale)
      )

      const selectedItem = this.findItem(selectedId)
      const { now } = this.store.animation
      const currentPosition = selectedItem.valueForFrame(now, '_position')

      if (fromArrowKey) {
        // Plain and Simple 1-for-1 movement from Arrow Keys
        selectedItem._position.setValue(Vector2.add(currentPosition, relativeMovement), now)
      } else if (this.store.build.hoveredControl === 'origin') {
        // Move origin of Selected item(s) (currently only for Containers)
        const currentOrigin = selectedItem.valueForFrame(now, '_origin')
        const transformationalInverse = relativeMovementScaledToCanvas
          .rotate(-1 * selectedItem.rotation.radians)
          .scale(1 / selectedItem.scale.x, 1 / selectedItem.scale.y)
        selectedItem.setOrigin(Vector2.add(currentOrigin, transformationalInverse), now)
      } else {
        // Move the selected item(s)
        // But apply the vector in the space of the item's parent so that it can be within
        // a container that's been rotated/scaled, but still move as if the mouse is
        // dragging it
        const { parentTransform } = selectedItem
        const parentTransformInverse = DOMMatrix.fromMatrix(parentTransform).invertSelf()
        const { a, b, c, d } = parentTransformInverse
        const { x, y } = relativeMovement
        const relativeMovementScaledToItemsParent = new Vector2(x * a + y * c, x * b + y * d)
        selectedItem._position.setValue(Vector2.add(currentPosition, relativeMovementScaledToItemsParent), now)
      }
    })
  }

  resizeAllSelectedByIncrement(relativeMovement) {
    // TODO: allow resizing to follow strict corner rules such that it will change the position
    // of an object (etc) in order to treat the opposite corner as the resize anchor.
    // This should likely be triggered by a hotkey such as Option+Drag
    const { activeControl } = this.store.build
    if (!activeControl) return
    const activeHandleIdx = parseInt(activeControl.split('-').pop(), 10)

    this.store.build.selectedIds.forEach((selectedId) => {
      const selectedItem = this.findItem(selectedId)
      const { now } = this.store.animation
      const currentWidth = selectedItem.valueForFrame(now, '_width')
      const currentHeight = selectedItem.valueForFrame(now, '_height')

      const { parentTransform, rotation, scale, alignment } = selectedItem
      const parentTransformInverse = DOMMatrix.fromMatrix(parentTransform).invertSelf()
      const { a, b, c, d } = parentTransformInverse
      const { x, y } = relativeMovement
      const relativeMovementScaledToItem = new Vector2(x * a + y * c, x * b + y * d)
        .rotate(-1 * rotation.radians)
        .scale(1 / scale.x, 1 / scale.y)

      let { x: deltaWidth, y: deltaHeight } = relativeMovementScaledToItem
      if (activeHandleIdx === 0) {
        deltaWidth *= -1
        deltaHeight *= -1
      } else if (activeHandleIdx === 1) {
        deltaHeight *= -1
      } else if (activeHandleIdx === 3) {
        deltaWidth *= -1
      }
      if (alignment.x === Alignment.CENTER) {
        deltaWidth *= 2
      }
      if (alignment.y === Alignment.CENTER) {
        deltaHeight *= 2
      }
      if (
        (alignment.x === Alignment.LEFT && [0, 3].includes(activeHandleIdx))
        || (alignment.x === Alignment.RIGHT && [1, 2].includes(activeHandleIdx))
      ) {
        deltaWidth = 0
      }
      if (
        (alignment.y === Alignment.TOP && [0, 1].includes(activeHandleIdx))
        || (alignment.y === Alignment.BOTTOM && [2, 3].includes(activeHandleIdx))
      ) {
        deltaHeight = 0
      }

      selectedItem._width.setValue(currentWidth + deltaWidth, now)
      selectedItem._height.setValue(currentHeight + deltaHeight, now)
    })
  }
}

export default RootContainer
export { scaleSteps }
