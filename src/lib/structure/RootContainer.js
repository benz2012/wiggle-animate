import { makeObservable, action, observable } from 'mobx'
import debounce from 'lodash.debounce'

import Container from './Container'
import Item from './Item'
import Size from './Size'
import Alignment from './Alignment'
import Angle from './Angle'
import Vector2 from './Vector2'
import Color from '../visuals/Color'
import Selection from './Selection'
import propertyValueTypeMap from './propertyValueTypeMap'
import { identityMatrix } from '../../utility/matrix'
import { zeroIfZero } from '../../utility/numbers'
import { drawStageDots, drawSelector, drawPotentialPathPoint } from '../../utility/drawing'
import { isPrimitive } from '../../utility/object'
import { flattenTreeToRelationships } from '../../utility/tree'
import { DEBOUNCE_DELAY_MS } from '../../utility/state'

const scaleSteps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5]

class RootContainer extends Container {
  static get INITIAL() {
    return {
      canvasPosition: new Vector2(0, 0),
      canvasScale: 1,
      canvasSize: new Size(1920, 1080),
      canvasFill: new Color({ r: 0, g: 0, b: 0 }),
      children: {},
      sortOrder: [],
    }
  }

  constructor(store) {
    super()
    this.store = store
    Item.rootContainer = this

    // non-observable, just for local reference
    this.rootWidth = window.innerWidth * this.DPR
    this.rootHeight = window.innerHeight * this.DPR
    this.arrowKeyMovement = {
      whichDebounceCall: 'LEADING',
      dataBefore: null,
    }

    this.canvasPosition = RootContainer.INITIAL.canvasPosition
    this._canvasScale = RootContainer.INITIAL.canvasScale
    this.canvasSize = RootContainer.INITIAL.canvasSize
    this.canvasFill = RootContainer.INITIAL.canvasFill
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
      setCanvasSize: action,
      setCanvasFill: action,
      checkPointerIntersections: action,
      findRectIntersections: action,
      changeScaleByStep: action,
    })
  }

  setCanvasSize(newValue) {
    if (newValue instanceof Size) {
      this.canvasSize = newValue
    } else if (Array.isArray(newValue) && newValue.length === 2) {
      this.canvasSize = new Size(...newValue)
    }
  }

  setCanvasFill(newValue) {
    if (newValue instanceof Color) {
      this.canvasFill = newValue
    } else {
      this.canvasFill = new Color(newValue)
    }
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
    // TODO [4]: the center actually needs to align with the offset from BestFit
    //       this is complicated because it begs the question, will the user be working
    //       in the center of the screen or in the center of the "screen minus left menu"
    // TODO [4]: if scaling with mousewheel, we should reposition towards the mouse, not the "center"
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

  get allItemsShown() {
    // remove root container id from list
    return super.allItemsShown.slice(1)
  }

  findItem(itemId) {
    if (!itemId) return null
    if (itemId === this.id) return this
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
      this.store.build.activeControl,
      this.store.build.selectedIds,
      this.store.selector.hovers,
      this.store.leftMenu.hoveredId,
      this.store.build.allChildrenOfSelectedContainers(this),
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
    super.draw(this.parentTransform, null, null, null, [], [], null, [])
    this.store.animation.drawingAFrameForExportHasFinished = true
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
    this.ctx.fillStyle = this.canvasFill.toString()
    this.ctx.fill()
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

    const isBrightCanvas = ((this.canvasFill.red + this.canvasFill.green + this.canvasFill.blue) / 3) > 145
    drawPotentialPathPoint(this.ctx, isBrightCanvas)
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
      this.store.build.setHovered(null)
      this.store.build.setHoveredControl(null)
    }
  }

  debouncedActionSubmitter = debounce(() => {
    if (this.arrowKeyMovement.whichDebounceCall === 'LEADING') {
      // On the leading edge, cache the current value so we know what to roll-back to
      // let valueToCache = property.isPrimitive ? property.value : property.value.toPureObject()
      this.arrowKeyMovement.dataBefore = this.store.build.selectedIds.map((selectedId) => {
        const selectedItem = this.findItem(selectedId)
        return [selectedId, selectedItem.position.toPureObject()]
      })
      this.arrowKeyMovement.whichDebounceCall = 'TRAILING'
    } else if (this.arrowKeyMovement.whichDebounceCall === 'TRAILING') {
      // On the trailing edge, now that we know both before/after states, submit the action, and clear the cache
      const dataAfter = this.store.build.selectedIds.map((selectedId) => {
        const selectedItem = this.findItem(selectedId)
        return [selectedId, selectedItem.position.toPureObject()]
      })

      // perform generic comparison to see if we should eliminate duplicate undo/redos
      const hasValueReallyChanged = JSON.stringify(this.arrowKeyMovement.dataBefore) !== JSON.stringify(dataAfter)
      if (hasValueReallyChanged) {
        const stateBefore = ['_position', this.store.animation.now, this.arrowKeyMovement.dataBefore]
        const stateAfter = ['_position', this.store.animation.now, dataAfter]
        this.store.actionStack.push({
          performedAt: Date.now() - DEBOUNCE_DELAY_MS,
          revert: ['rootContainer.setValueForItems', stateBefore],
          perform: ['rootContainer.setValueForItems', stateAfter],
        })
      }

      this.arrowKeyMovement.dataBefore = null
      this.arrowKeyMovement.whichDebounceCall = 'LEADING'
    }
  }, DEBOUNCE_DELAY_MS, { leading: true, trailing: true })

  moveAllSelectedByIncrement(relativeMovement, fromArrowKey = false) {
    const addedKeyframeData = []

    if (fromArrowKey && this.arrowKeyMovement.whichDebounceCall === 'LEADING') {
      this.debouncedActionSubmitter()
    }

    this.store.build.selectedIds.forEach((selectedId) => {
      const relativeMovementScaledToCanvas = Vector2.multiply(
        relativeMovement,
        new Vector2(1 / this.canvasScale, 1 / this.canvasScale)
      )

      const selectedItem = this.findItem(selectedId)
      const { now } = this.store.animation
      const currentPosition = selectedItem.position
      let addedKeyframePosition
      let addedKeyframeOrigin

      if (fromArrowKey) {
        // Plain and Simple 1-for-1 movement from Arrow Keys
        addedKeyframePosition = selectedItem._position.setValue(
          Vector2.add(currentPosition, relativeMovement),
          now
        )
      } else if (this.store.build.hoveredControl === 'origin') {
        // Move origin of Selected item(s) (currently only for Containers)
        const currentOrigin = selectedItem.origin
        const transformationalInverse = relativeMovementScaledToCanvas
          .rotate(-1 * selectedItem.rotation.radians)
          .scale(1 / selectedItem.scale.x, 1 / selectedItem.scale.y)
        const addedKeyframes = selectedItem.setOrigin(
          Vector2.add(currentOrigin, transformationalInverse),
          now
        )
        addedKeyframeOrigin = addedKeyframes[0]
        addedKeyframePosition = addedKeyframes[1]
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
        addedKeyframePosition = selectedItem._position.setValue(
          Vector2.add(currentPosition, relativeMovementScaledToItemsParent),
          now
        )
      }

      if (addedKeyframePosition) {
        addedKeyframeData.push([selectedId, '_position', addedKeyframePosition.toPureObject()])
      }
      if (addedKeyframeOrigin) {
        addedKeyframeData.push([selectedId, '_origin', addedKeyframeOrigin.toPureObject()])
      }
    })

    // It would be cleaner to call this after adding the keyframe action, but instead I opted for
    // consistency with mouse movements. This creates the same flaw where the redo-apply-keyframe
    // uses the first changed value, not the true original value.
    if (fromArrowKey && this.arrowKeyMovement.whichDebounceCall === 'TRAILING') {
      this.debouncedActionSubmitter()
    }

    if (addedKeyframeData.length > 0) {
      const revertState = addedKeyframeData.map((oneData) => ([oneData[0], oneData[1], oneData[2].id]))
      this.store.actionStack.push({
        revert: ['keyframeEditor.deleteManyKeysOnProperties', [revertState]],
        perform: ['keyframeEditor.pushManyKeysOnProperties', [addedKeyframeData]],
      })
    }
  }

  resizeAllSelectedByIncrement(relativeMovement) {
    // TODO [4]: allow resizing to follow strict corner rules such that it will change the position
    // of an object (etc) in order to treat the opposite corner as the resize anchor.
    // This should likely be triggered by a hotkey such as Option+Drag
    const { activeControl } = this.store.build
    if (!activeControl) return
    const activeHandleIdx = parseInt(activeControl.split('--').pop(), 10)
    const resizeHandleIndicies = [0, 1, 2, 3]
    if (!resizeHandleIndicies.includes(activeHandleIdx)) return

    const addedKeyframeData = []

    this.store.build.selectedIds.forEach((selectedId) => {
      const selectedItem = this.findItem(selectedId)
      const { now } = this.store.animation
      const currentWidth = selectedItem.width
      const currentHeight = selectedItem.height

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

      const addedKeyframeWidth = selectedItem._width.setValue(currentWidth + deltaWidth, now)
      const addedKeyframeHeight = selectedItem._height.setValue(currentHeight + deltaHeight, now)

      if (addedKeyframeWidth) {
        addedKeyframeData.push([selectedId, '_width', addedKeyframeWidth.toPureObject()])
      }
      if (addedKeyframeHeight) {
        addedKeyframeData.push([selectedId, '_height', addedKeyframeHeight.toPureObject()])
      }
    })

    if (addedKeyframeData.length > 0) {
      const revertState = addedKeyframeData.map((oneData) => ([oneData[0], oneData[1], oneData[2].id]))
      this.store.actionStack.push({
        revert: ['keyframeEditor.deleteManyKeysOnProperties', [revertState]],
        perform: ['keyframeEditor.pushManyKeysOnProperties', [addedKeyframeData]],
      })
    }
  }

  rotateAllSelectedToPoint(toPoint) {
    const { activeControl, hoveredId } = this.store.build
    const itemIdBeingTargeted = activeControl ? activeControl.split('--')[0] : hoveredId
    const itemBeingTargeted = this.findItem(itemIdBeingTargeted)
    const itemBeingTargetedRotationCenter = new DOMMatrix(itemBeingTargeted.parentTransform)
      .translateSelf(...itemBeingTargeted.position.values)
      .translateSelf(...itemBeingTargeted.origin.values)
    const fromPoint = new Vector2(itemBeingTargetedRotationCenter.e, itemBeingTargetedRotationCenter.f)
    const fromRotationSimple = ((itemBeingTargeted.rotation.degrees % 360) + 360) % 360

    const addedKeyframeData = []

    this.store.build.selectedIds.forEach((selectedId) => {
      const { now } = this.store.animation
      const selectedItem = this.findItem(selectedId)
      const { parentTransform, rotation } = selectedItem
      const parentRotation = Angle.vectorUnitCircleAngle(parentTransform.a, parentTransform.b)

      const rotationVector = Vector2.subtract(toPoint, fromPoint)
      const rotationVectorOnUnitCircle = Vector2.multiply(rotationVector, { x: 1, y: -1 })
      const rotationAngle = Angle.vectorUnitCircleAngle(...rotationVectorOnUnitCircle.values)

      let setDegreesTo = ((360 - rotationAngle.degrees) + 90) // convert from unit circle to clockwise-up-0
      setDegreesTo -= parentRotation.degrees // discount any parent rotations
      setDegreesTo += (360 * 10) // eliminate negatives for now
      setDegreesTo %= 360

      /* Allows angle spinning beyond +360 & -360 */
      const previousSpinCount = Math.floor(rotation.degrees / 360)
      let nextSpinCount = previousSpinCount
      nextSpinCount = zeroIfZero(nextSpinCount)
      const rvrtp = rotationVector.rotate(-1 * parentRotation.radians) // rvrtp: Rotation Vector Rotated To Parent
      const previousRightOfAxis = fromRotationSimple >= 0 && fromRotationSimple <= 90
      const previousLeftOfAxis = fromRotationSimple >= 270 && fromRotationSimple < 360
      if (rvrtp.y <= 0) {
        if (previousRightOfAxis && rvrtp.x < 0) {
          nextSpinCount -= 1
        } else if (previousLeftOfAxis && rvrtp.x >= 0) {
          nextSpinCount += 1
        }
      }
      setDegreesTo += (nextSpinCount * 360)

      const addedKeyframe = selectedItem._rotation.setValue(setDegreesTo, now)
      if (addedKeyframe) {
        addedKeyframeData.push([selectedId, '_rotation', addedKeyframe.toPureObject()])
      }
    })

    if (addedKeyframeData.length > 0) {
      const revertState = addedKeyframeData.map((oneData) => ([oneData[0], oneData[1], oneData[2].id]))
      this.store.actionStack.push({
        revert: ['keyframeEditor.deleteManyKeysOnProperties', [revertState]],
        perform: ['keyframeEditor.pushManyKeysOnProperties', [addedKeyframeData]],
      })
    }
  }

  setValueForItems(propertyName, when, itemData) {
    /**
     * Sets the value of one or more properties across many items, all at once.
     * Ideally this is only used in undo/redo actions.
     *
     * propertyName shape is: '_propName' or '_propName1&_propName2'
     * itemData shape is: [[itemId1, pureValue1], [itemId2, pureValue2], ...]
     *          notice that it is an array of arrays, so for one change: [[itemId1, pureValue1]]
     */
    let isMulti = false
    let properties = [propertyName]
    if (propertyName.includes('&')) {
      isMulti = true
      properties = propertyName.split('&')
    }

    itemData.forEach((entry) => {
      const [itemId, pureValue] = entry
      const item = this.store.rootContainer.findItem(itemId)

      properties.forEach((_propertyName, index) => {
        let _pureValue = pureValue
        if (isMulti) {
          _pureValue = pureValue[index]
        }

        let newValueWithType = _pureValue
        if (!isPrimitive(newValueWithType)) {
          // Follows logic from Property.fromPureObject() with respect to Selection Properties
          if (_pureValue.className === Selection.className) {
            item[_propertyName].value.fromPureObject(_pureValue)
            return
          }

          if (_propertyName === '_origin') {
            const ValueType = Vector2
            const _pureOrigin = _pureValue[0]
            const _purePosition = _pureValue[1]
            const newOrigin = ValueType.fromPureObject(_pureOrigin)
            const newPosition = ValueType.fromPureObject(_purePosition)
            item.setOrigin(newOrigin, when, newPosition)
            return
          }

          const ValueType = propertyValueTypeMap[_pureValue.className]
          newValueWithType = ValueType.fromPureObject(_pureValue)
        }

        item[_propertyName].setValue(newValueWithType, when)
      })
    })
  }

  setTree(tree, toSelectAfter) {
    /**
     * Set the parents, children, and sortOrder of all items/containers in the tree via a declarative input
     */
    const relationships = flattenTreeToRelationships(tree)
    const containers = {}
    const childrenToMove = []

    Object.entries(relationships).forEach((relationship) => {
      const [containerId, expectedChildren] = relationship

      // Get container instance references
      const container = this.findItem(containerId)
      // If container doesn't exist in the tree then it's already being moved via a previous relationship
      if (!container) return
      // Cache references for use below
      containers[containerId] = container

      const misplacedChildren = Object.keys(container.children).filter((childId) => !expectedChildren.includes(childId))
      misplacedChildren.forEach((childId) => {
        const child = container.children[childId]
        container.remove(childId)
        childrenToMove.push(child)
      })
    })

    childrenToMove.forEach((child) => {
      const expectedParentId = Object.entries(relationships)
        .find(([_, children]) => children.includes(child.id))[0]
      const expectedParent = containers[expectedParentId]
      expectedParent.add(child, null, false)
    })

    Object.values(containers).forEach((container) => {
      const expectedSortOrder = relationships[container.id]
      container.sortOrder.sort((childAId, childBId) => (
        expectedSortOrder.indexOf(childAId) - expectedSortOrder.indexOf(childBId)
      ))
    })

    this.store.build.setSelected(toSelectAfter)
  }

  toPureObject() {
    const finalPureObject = {
      canvas: {
        // I think saving Canvas position and scale is a bit jarring when loading a project, but will think on it
        // position: this.canvasPosition.toPureObject(),
        // scale: this.canvasScale,
        size: this.canvasSize.toPureObject(),
        fill: this.canvasFill.toPureObject(),
      },
      children: this.sortOrder.map((childId) => this.children[childId].toPureObject()),
    }
    return finalPureObject
  }

  fromPureObject({ canvas, children }) {
    // this.canvasPosition = Vector2.fromPureObject(canvas.position)
    // this._canvasScale = canvas.scale
    this.canvasSize = Size.fromPureObject(canvas.size)
    this.canvasFill = Color.fromPureObject(canvas.fill)
    super.fromPureObject({ children, id: this.id })
  }
}

export default RootContainer
export { scaleSteps }
