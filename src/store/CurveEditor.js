import { makeAutoObservable } from 'mobx'

import Keyframe from '../lib/animation/Keyframe'
import { clamp } from '../utility/numbers'
import { keyframeLabelFromProperty } from '../utility/state'

// TODO [3]: handle drag release when outside of HTML element

class CurveEditor {
  constructor(store) {
    this.store = store

    this.innerWidth = 0
    this.handle1Intersection = false
    this.handle2Intersection = false
    this.dragStart = null
    this.dragStartWhichHandle = null

    makeAutoObservable(this)
  }

  setInnerWidth(value) { this.innerWidth = value }

  setHandleIntersection = (handleNum, value) => {
    this[`handle${handleNum}Intersection`] = value
  }

  startDrag(vector, whichHandle) {
    this.dragStart = vector
    this.dragStartWhichHandle = whichHandle
  }

  stopDrag() {
    this.dragStart = null
    this.dragStartWhichHandle = null
  }

  moveHandleByIncrement(relativeMovement) {
    const whichHandle = this.dragStartWhichHandle
    const [_, targetKeyframes] = this.targetKeyframeInfo

    // Note: we do the inverse tranformation from Quadrant4 to anchor-relative position
    let toChangeX = relativeMovement.x / this.innerWidth
    let toChangeY = relativeMovement.y / this.innerWidth

    let handleTargetIdx
    let handleTargetType
    if (whichHandle === 1) {
      handleTargetIdx = 0
      handleTargetType = 'handleOut'
      toChangeY *= -1
    } else if (whichHandle === 2) {
      handleTargetIdx = 1
      handleTargetType = 'handleIn'
      toChangeX *= -1
    }

    if (handleTargetIdx != null && handleTargetType != null) {
      const targetControlHandle = targetKeyframes[handleTargetIdx][handleTargetType]
      const newInfluence = targetControlHandle.influence + toChangeX
      const newDistance = targetControlHandle.distance + toChangeY
      targetControlHandle.influence = clamp(newInfluence, 0, 1)
      targetControlHandle.distance = clamp(newDistance, 0, 1)
    }
  }

  get targetKeyframeInfo() {
    const emptyReturn = [false, [], '']
    if (this.store.keyframeEditor.dragHasMovedAtLeastOneFrame) {
      // Dragging keyframes creates jenky output in the curve editor, so disable that possibility
      return emptyReturn
    }

    const selectedKeyframeFullIds = this.store.keyframeEditor.selectedIds
    const numSelected = selectedKeyframeFullIds.length

    if ([1, 2].includes(numSelected) === false) {
      // We can only find a pair of keyframes when 1 or 2 is selected
      return emptyReturn
    }

    const selectedItem = this.store.rootContainer.findItem(this.store.build.selectedIds[0])

    if (numSelected === 1) {
      const fullId = selectedKeyframeFullIds[0]
      const [_, selectedPropName, selectedKeyframeId] = fullId.split('--')
      const selectedProperty = selectedItem[selectedPropName]
      if (selectedProperty.keyframes.length === 1) {
        // One is selected but the are no others to create a pair
        return emptyReturn
      }

      const sortedKeyframes = [...selectedProperty.keyframes].sort(Keyframe.sort)
      const selectedKeyframeIdx = sortedKeyframes.findIndex((keyframe) => keyframe.id === selectedKeyframeId)
      const nextKeyframeIdx = selectedKeyframeIdx + 1
      if ((sortedKeyframes.length - 1) < (selectedKeyframeIdx + 1)) {
        // The one that is selected is the last one, no pair exists
        return emptyReturn
      }

      const keyframeLabel = keyframeLabelFromProperty(selectedProperty)
      return [true, [sortedKeyframes[selectedKeyframeIdx], sortedKeyframes[nextKeyframeIdx]], keyframeLabel]
    }

    const seenItemIds = {}
    const seenPropNames = {}
    const seenKeyframeIds = []

    const areSelectedKeyframesFromSameItemAndProp = selectedKeyframeFullIds
      .every((fullId) => {
        const [selectedItemId, selectedPropName, selectedKeyframeId] = fullId.split('--')
        if (!(selectedItemId in seenItemIds) && Object.keys(seenItemIds).length > 0) {
          return false
        }
        seenItemIds[selectedItemId] = true
        if (!(selectedPropName in seenPropNames) && Object.keys(seenPropNames).length > 0) {
          return false
        }
        seenPropNames[selectedPropName] = true
        seenKeyframeIds.push(selectedKeyframeId)
        return true
      })

    if (!areSelectedKeyframesFromSameItemAndProp) {
      return emptyReturn
    }

    const selectedPropName = Object.keys(seenPropNames)[0]
    const selectedProperty = selectedItem[selectedPropName]
    const sortedKeyframes = [...selectedProperty.keyframes].sort(Keyframe.sort)
    const keyIdx1 = sortedKeyframes.findIndex((keyframe) => keyframe.id === seenKeyframeIds[0])
    const keyIdx2 = sortedKeyframes.findIndex((keyframe) => keyframe.id === seenKeyframeIds[1])
    if (Math.abs(keyIdx2 - keyIdx1) !== 1) {
      // The two that are selected are not in-sequence
      return emptyReturn
    }

    const _targetKeyframes = [sortedKeyframes[keyIdx1], sortedKeyframes[keyIdx2]].sort(Keyframe.sort)
    const keyframeLabel = keyframeLabelFromProperty(selectedProperty)
    return [true, _targetKeyframes, keyframeLabel]
  }
}

export default CurveEditor
