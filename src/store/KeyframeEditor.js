import { makeAutoObservable } from 'mobx'

import theme from '../ui/theme'
import { CSS_ROTATION_OFFSET } from '../ui/BottomMenu/config'
import Keyframe from '../lib/animation/Keyframe'

// TODO [2]: Keyframes can be dragged to less than 1 for some reason

class KeyframeEditor {
  constructor(store) {
    this.store = store

    this.hoveredProperty = null
    this.newKeyPosition = null
    this.selectedIds = []
    this.dragStart = null
    this.dragStartFrameNums = {}
    this.dragHasMovedAtLeastOneFrame = false
    this.pixelsPerFrame = null

    this.lineWidthLessThanParent = 32
    this.curveEditorWidth = 268

    makeAutoObservable(this)
  }

  setHoveredProperty(value) { this.hoveredProperty = value }

  setNewKeyPosition(value) { this.newKeyPosition = value }

  setSelected(values) { this.selectedIds = values }

  addToSelection(values) {
    this.selectedIds = [...this.selectedIds, ...values]
  }

  removeFromSelection(values) {
    this.selectedIds = this.selectedIds.filter((id) => !values.includes(id))
  }

  selectAllVisible() {
    const selectedItem = this.store.rootContainer.findItem(this.store.build.selectedIds[0])
    if (!selectedItem) return
    const allVisibleKeyframeIdsForSelectedItem = selectedItem.keyframables.reduce((runningList, propName) => {
      const property = selectedItem[propName]
      const keyframeIdPrefix = `${selectedItem.id}--${propName}`
      const visibleKeyframeIds = property.keyframes
        .filter((keyframe) => (
          keyframe.frame >= this.store.animation.firstFrame && keyframe.frame <= this.store.animation.lastFrame
        ))
        .map((keyframe) => `${keyframeIdPrefix}--${keyframe.id}`)
      const newRunningList = [...runningList, ...visibleKeyframeIds]
      return newRunningList
    }, [])
    this.setSelected(allVisibleKeyframeIdsForSelectedItem)
  }

  setPixelsPerFrame(value) { this.pixelsPerFrame = value }

  startDrag(startingX) {
    this.dragStart = startingX
    const selectedItem = this.store.rootContainer.findItem(this.store.build.selectedIds[0])
    this.dragStartFrameNums = this.selectedIds.reduce((final, keyframeFullId) => {
      /* eslint-disable no-param-reassign */
      const [_, propertyName, keyframeId] = keyframeFullId.split('--')
      const keyframe = selectedItem[propertyName].keyframes.find((k) => k.id === keyframeId)
      final[keyframeId] = keyframe.frame
      return final
    }, {})
    this.dragHasMovedAtLeastOneFrame = false
  }

  stopDrag() {
    this.dragStart = null
    this.dragStartFrameNums = {}
    this.dragHasMovedAtLeastOneFrame = false
  }

  moveAllSelectedToFrameForX(xPosition, mouseMovementDirection) {
    if (!this.dragStart) return
    const xOffset = xPosition - this.dragStart
    const framesToMove = Math.round(xOffset / this.pixelsPerFrame)

    if (framesToMove !== 0) {
      this.dragHasMovedAtLeastOneFrame = true
    }

    const selectedItem = this.store.rootContainer.findItem(this.store.build.selectedIds[0])
    const sortingAlgorithm = mouseMovementDirection > 0 ? Keyframe.reverseSort : Keyframe.sort

    const selectedKeyframeIdsPerProperty = this.selectedIds.reduce((currentObj, keyframeFullId) => {
      const [_, propertyName, keyframeId] = keyframeFullId.split('--')
      if (!(propertyName in currentObj)) {
        currentObj[propertyName] = []
      }
      currentObj[propertyName].push(keyframeId)
      return currentObj
    }, {})
    const targetKeyframesSortedPerProperty = selectedItem.keyframables.reduce((currentObj, propertyName) => {
      const selectedKeyframeIdsForThisProperty = propertyName in selectedKeyframeIdsPerProperty
        ? selectedKeyframeIdsPerProperty[propertyName]
        : []
      const keyframesToAdd = selectedItem[propertyName].keyframes
        .filter((keyframe) => selectedKeyframeIdsForThisProperty.includes(keyframe.id))
        .sort(sortingAlgorithm)
      currentObj[propertyName] = keyframesToAdd
      return currentObj
    }, {})

    Object.entries(targetKeyframesSortedPerProperty).forEach(([propertyName, keyframes]) => {
      keyframes.forEach((targetKeyframe) => {
        const otherKeyframeNumsOnThisProperty = selectedItem[propertyName].keyframes
          .filter((keyframe) => keyframe.id !== targetKeyframe.id)
          .map((keyframe) => keyframe.frame)

        const initialFrameNum = this.dragStartFrameNums[targetKeyframe.id]
        let newFrameToSet = initialFrameNum + framesToMove
        if (newFrameToSet === targetKeyframe.frame) return

        // Ensure it's actually safe to move this keyframe to that new frame
        if (newFrameToSet > this.store.animation.frames) {
          newFrameToSet = this.store.animation.frames
        } else if (newFrameToSet < Animation.FIRST) {
          newFrameToSet = Animation.FIRST
        }
        // Prevent keyframes from overlapping
        if (otherKeyframeNumsOnThisProperty.includes(newFrameToSet)) {
          newFrameToSet = targetKeyframe.frame
        }

        targetKeyframe.frame = newFrameToSet
      })
    })
  }

  get hoverInfo() {
    const { firstFrame: frameIn, lastFrame: frameOut } = this.store.animation
    const { newKeyPosition, pixelsPerFrame } = this
    const playheadHoverFrame = this.store.playhead.hoverLineFrame

    const leftOffset = theme.spacing[1]
    const uxFeelingOffset = 3
    const _numFramesShown = frameOut - frameIn + 1

    // Start with a comfortable position in relation to the mouse
    let _drawNewKeyAt = newKeyPosition - CSS_ROTATION_OFFSET - leftOffset + uxFeelingOffset
    // Snapping to Frames
    _drawNewKeyAt = Math.floor((_drawNewKeyAt + pixelsPerFrame / 2) / pixelsPerFrame) * pixelsPerFrame
    // Convert to Frame Number
    const relativeFrameHovered = Math.round(_drawNewKeyAt / pixelsPerFrame)
    let _absoluteFrameHovered = frameIn + relativeFrameHovered

    // Overwrite values if the hover takes place in Playhead region
    if (playheadHoverFrame != null) {
      _absoluteFrameHovered = playheadHoverFrame
      const _relativeFrameHovered = _absoluteFrameHovered - frameIn
      _drawNewKeyAt = _relativeFrameHovered * pixelsPerFrame
    }

    // Prevent interactions past the frame boundaries (because we allow hovers beyond, for better UX)
    if (_absoluteFrameHovered < frameIn) {
      _drawNewKeyAt = 0
      _absoluteFrameHovered = frameIn
    } else if (_absoluteFrameHovered > frameOut) {
      _drawNewKeyAt = ((_numFramesShown - 1) * pixelsPerFrame)
      _absoluteFrameHovered = frameOut
    }

    // Final CSS Movement Tweaks
    _drawNewKeyAt -= CSS_ROTATION_OFFSET
    return [_drawNewKeyAt, _absoluteFrameHovered]
  }
}

export default KeyframeEditor
