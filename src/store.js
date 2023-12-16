import { observable, makeObservable, action, computed } from 'mobx'
// import { autorun } from 'mobx'

import RootContainer from './lib/structure/RootContainer'
import Container from './lib/structure/Container'
import Vector2 from './lib/structure/Vector2'
import Size from './lib/structure/Size'
import Rectangle from './lib/shapes/Rectangle'
import Ellipse from './lib/shapes/Ellipse'
import Text from './lib/shapes/Text'
import Polygon from './lib/shapes/Polygon'
import Line from './lib/shapes/Line'
import Path from './lib/shapes/Path'
import Animation from './lib/animation/Animation'
import Keyframe from './lib/animation/Keyframe'
import { prepareForExport, exportOneFrame, exportVideo, downloadBlob } from './utility/video'
// import { storageEnabled } from './utility/storage'
import { sleep } from './utility/time'
import { isEqual } from './utility/array'
import { clamp } from './utility/numbers'
import { keyframeLabelFromProperty } from './utility/state'

class RootStore {
  constructor() {
    // Auto Save & Auto Load
    // if (storageEnabled()) {
    //   const projectObj = localStorage.getItem('micrograph.project')
    //   if (projectObj) {
    //     setTimeout(() => {
    //       this.project.load(projectObj)
    //     }, 100)
    //   }

    //   autorun(() => {
    //     const projectAsJSON = this.project.save()
    //     localStorage.setItem('micrograph.project', projectAsJSON)
    //   }, { delay: 300 })
    // }

    this.DPR = window.devicePixelRatio || 1

    this.rootContainer = new RootContainer(this)

    this.project = {
      name: '',
      saveStatus: 'unknown',
      isExporting: false,
      exportFileName: '',
    }

    this.build = {
      tool: '',
      pointerPosition: null,
      activePath: null,
      activeControl: null,
      selectedIds: [],
      hoveredId: null,
      hoveredControl: null,
      dragStart: null,
      preDrag: false,
    }
    this.tools = {
      NONE: '',
      PATH: 'path',
      RESIZE: 'resize',
      ROTATE: 'rotate',
    }

    this.selector = {
      rect: new Size(0, 0),
      position: new Vector2(0, 0),
      hovers: [],
    }

    this.view = {}

    this.playhead = {
      hovered: false,
      hoverLineFrame: null,
      dragStart: null,
      pixelsPerFrame: null,
      cssWidth: 12,
      cssStrokeProtrusion: 2,
      cssFrameOneStart: 100,
      canvasWidthLessThanWindow: 184,
      canvasHeight: 33,
      boundRegionHeight: 8,
    }
    this.playhead = {
      // define computed statics here
      ...this.playhead,
      cssTrueHalf: (this.playhead.cssWidth + this.playhead.cssStrokeProtrusion) / 2,
    }

    this.keyHeld = {
      Space: false,
      Shift: false,
      Meta: false,
      MiddleMouse: false,
    }

    this.propertyEditor = {
      position: new Vector2(16, 42 + 16 + 8),
      hiddenGroups: {},
      pairedVectors: {},
    }

    this.keyframeEditor = {
      hoveredProperty: null,
      newKeyPosition: null,
      selectedIds: [],
      dragStart: null,
      dragStartFrameNums: {},
      dragHasMovedAtLeastOneFrame: false,
      pixelsPerFrame: null,
      lineWidthLessThanParent: 32,
      curveEditorWidth: 268,
    }

    this.curveEditor = {
      regionWidth: 0,
      handle1Intersection: false,
      handle2Intersection: false,
      dragStart: null,
      dragStartWhichHandle: null,
    }

    this.animation = new Animation()
    // TODO [-]: remove this after debugging
    window._animation = this.animation

    makeObservable(this, {
      // rootContainer: Never changes, no need for observable, observable within
      project: observable,
      build: observable,
      selector: observable,
      view: observable,
      playhead: observable,
      keyHeld: observable,
      propertyEditor: observable,
      keyframeEditor: observable,
      curveEditor: observable,
      // animation: Never changes, no need for observable, observable within

      setExporting: action,
      addNewPath: action,
      commitPath: action,

      setTool: action,
      setPointerPosition: action,
      setHovered: action,
      setHoveredControl: action,
      setActiveControl: action,
      setSelected: action,
      addToSelection: action,
      removeFromSelection: action,

      indicatePreDrag: action,
      startDrag: action,
      stopDrag: action,

      setSelectorPosition: action,
      setSelectorRect: action,
      setSelectorHovers: action,

      resetView: action,

      setPlayheadHovered: action,
      setPlayheadHoverLineFrame: action,
      startPlayheadDrag: action,
      stopPlayheadDrag: action,
      setPlayheadPixelsPerFrame: action,

      setKeyHeld: action,

      setPropertyEditorPosition: action,
      hidePropertyGroup: action,
      showPropertyGroup: action,
      setPairedVector: action,

      setHoveredProperty: action,
      setNewKeyPosition: action,
      setSelectedKeyframes: action,
      addKeyframeToSelection: action,
      addKeyframesToSelection: action,
      removeKeyframeFromSelection: action,
      removeKeyframesFromSelection: action,
      selectAllVisibleKeyframes: action,
      setKeyframePixelsPerFrame: action,
      startKeyframeDrag: action,
      stopKeyframeDrag: action,
      moveKeyframesToFrameForX: action,

      setCurveRegionWidth: action,
      setHandleIntersection: action,
      startCurveEditorDrag: action,
      stopCurveEditorDrag: action,
      moveKeyframeCurveHandleByIncrement: action,

      /* Computeds */
      determineCurrentAction: computed,
      curveEditorTargets: computed,
    })
  }

  get determineCurrentAction() {
    const { preDrag, dragStart, hoveredId, hoveredControl, tool, selectedIds } = this.build

    if (this.keyHeld.Space || this.keyHeld.MiddleMouse) {
      if (preDrag || dragStart) {
        return 'dragging'
      }
      return 'readyToMoveView'
    }

    if (tool === this.tools.PATH) {
      return 'addingPathPoints'
    }

    if (hoveredId) {
      let controlAction = null
      if (hoveredControl && hoveredControl.startsWith('handle')) {
        controlAction = hoveredControl.split('--').pop()
      }

      if (selectedIds.length > 0) {
        if (preDrag || dragStart) {
          if (controlAction) return controlAction
          return 'dragging'
        }
        if (this.keyHeld.Meta || this.keyHeld.Shift) {
          return 'adding'
        }

        if (controlAction) return controlAction
      }

      return 'hovering'
    }

    if (this.keyHeld.Meta || this.keyHeld.Shift) {
      if (selectedIds.length > 0) {
        return 'adding'
      }
    }

    return null
  }

  /* Container/Stage Actions */
  addNewItem(newItem) {
    const { selectedIds } = this.build
    const found = this.rootContainer.findItemAndParent(selectedIds[0])
    const selectedItem = found?.item
    if (selectedItem instanceof Container) {
      selectedItem.add(newItem)
    } else if (selectedItem) {
      found.parent.add(newItem)
    } else {
      this.rootContainer.add(newItem)
    }
    // TODO [-]: remove this after debugging
    window._item = newItem
    return newItem
  }

  addContainer() {
    const newContainer = new Container()
    newContainer.setOrigin(new Vector2(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
    return this.addNewItem(newContainer)
  }

  addRectangle() {
    return this.addNewItem(new Rectangle(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addEllipse() {
    return this.addNewItem(new Ellipse(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addText() {
    return this.addNewItem(new Text(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addPolygon() {
    return this.addNewItem(new Polygon(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addLine() {
    return this.addNewItem(new Line(
      this.rootContainer.canvasSize.width / 2,
      this.rootContainer.canvasSize.height / 2,
    ))
  }

  addNewPath() {
    const newPath = new Path()
    this.addNewItem(newPath)
    this.build.activePath = newPath
    return newPath
  }

  commitPath() {
    let pathId
    if (this.build.activePath) {
      pathId = this.build.activePath.id
      this.build.activePath.commitPath()
    }
    this.build.tool = this.tools.NONE
    this.build.activePath = null
    this.build.pointerPosition = null
    if (pathId) {
      this.setSelected([pathId])
    }
  }

  /* Project Actions */
  setExporting(value) {
    this.project.isExporting = value
  }

  /* Build Actions */
  setTool(value) { this.build.tool = value }
  setPointerPosition(value) { this.build.pointerPosition = value }
  setHovered(value) { this.build.hoveredId = value }
  setHoveredControl(value) { this.build.hoveredControl = value }
  setActiveControl(value) { this.build.activeControl = value }

  indicatePreDrag(indication) { this.build.preDrag = indication }
  startDrag(vector) { this.build.dragStart = vector }
  stopDrag() {
    this.build.preDrag = false
    this.build.dragStart = null
  }

  setSelected(values) {
    if (!isEqual(this.build.selectedIds, values)) {
      this.setSelectedKeyframes([])
    }
    this.build.selectedIds = values
  }

  addToSelection(value) {
    this.build.selectedIds = [...this.build.selectedIds, value]
    this.setSelectedKeyframes([])
  }

  removeFromSelection(value) {
    this.build.selectedIds = this.build.selectedIds.filter((id) => id !== value)
    this.setSelectedKeyframes([])
  }

  selectAll() {
    this.setSelected(this.rootContainer.allItems)
  }

  /* Selector Actions */
  setSelectorPosition(vector) {
    this.selector.position.x = vector.x
    this.selector.position.y = vector.y
  }

  setSelectorRect(width, height) {
    this.selector.rect.width = width
    this.selector.rect.height = height
  }

  setSelectorHovers(values) { this.selector.hovers = values }

  /* View Actions */
  resetView() {
    this.rootContainer.setCanvasToBestFit()
  }

  /* Playhead Actions */
  setPlayheadHovered(value) { this.playhead.hovered = value }
  setPlayheadHoverLineFrame(value) { this.playhead.hoverLineFrame = value }
  startPlayheadDrag(vector) { this.playhead.dragStart = vector }
  stopPlayheadDrag() { this.playhead.dragStart = null }
  setPlayheadPixelsPerFrame(value) { this.playhead.pixelsPerFrame = value }

  /* Key Hold Actions */
  setKeyHeld(key, state) {
    this.keyHeld[key] = state
  }

  /* Property Editor Actions */
  setPropertyEditorPosition(value) {
    this.propertyEditor.position.x = value.x
    this.propertyEditor.position.y = value.y
  }

  hidePropertyGroup(groupName) {
    this.propertyEditor.hiddenGroups[groupName] = true
  }

  showPropertyGroup(groupName) {
    this.propertyEditor.hiddenGroups[groupName] = false
  }

  setPairedVector(propertyKey, shouldPair) {
    this.propertyEditor.pairedVectors[propertyKey] = shouldPair
  }

  /* Keyframe Editor Actions */
  setHoveredProperty(value) {
    this.keyframeEditor.hoveredProperty = value
  }

  setNewKeyPosition(value) {
    this.keyframeEditor.newKeyPosition = value
  }

  setSelectedKeyframes(values) {
    this.keyframeEditor.selectedIds = values
  }

  addKeyframeToSelection(value) {
    this.keyframeEditor.selectedIds = [...this.keyframeEditor.selectedIds, value]
  }

  addKeyframesToSelection(values) {
    this.keyframeEditor.selectedIds = [...this.keyframeEditor.selectedIds, ...values]
  }

  removeKeyframeFromSelection(value) {
    this.keyframeEditor.selectedIds = this.keyframeEditor.selectedIds.filter((id) => id !== value)
  }

  removeKeyframesFromSelection(values) {
    this.keyframeEditor.selectedIds = this.keyframeEditor.selectedIds.filter((id) => !values.includes(id))
  }

  selectAllVisibleKeyframes() {
    const selectedItem = this.rootContainer.findItem(this.build.selectedIds[0])
    if (!selectedItem) return
    const allVisibleKeyframeIdsForSelectedItem = selectedItem.keyframables.reduce((runningList, propName) => {
      const property = selectedItem[propName]
      const keyframeIdPrefix = `${selectedItem.id}--${propName}`
      const visibleKeyframeIds = property.keyframes
        .filter((keyframe) => (
          keyframe.frame >= this.animation.firstFrame && keyframe.frame <= this.animation.lastFrame
        ))
        .map((keyframe) => `${keyframeIdPrefix}--${keyframe.id}`)
      const newRunningList = [...runningList, ...visibleKeyframeIds]
      return newRunningList
    }, [])
    this.setSelectedKeyframes(allVisibleKeyframeIdsForSelectedItem)
  }

  setKeyframePixelsPerFrame(value) { this.keyframeEditor.pixelsPerFrame = value }

  startKeyframeDrag(startingX) {
    this.keyframeEditor.dragStart = startingX
    const selectedItem = this.rootContainer.findItem(this.build.selectedIds[0])
    this.keyframeEditor.dragStartFrameNums = this.keyframeEditor.selectedIds.reduce((final, keyframeFullId) => {
      /* eslint-disable no-param-reassign */
      const [_, propertyName, keyframeId] = keyframeFullId.split('--')
      const keyframe = selectedItem[propertyName].keyframes.find((k) => k.id === keyframeId)
      final[keyframeId] = keyframe.frame
      return final
    }, {})
    this.keyframeEditor.dragHasMovedAtLeastOneFrame = false
  }

  stopKeyframeDrag() {
    this.keyframeEditor.dragStart = null
    this.keyframeEditor.dragStartFrameNums = {}
    this.keyframeEditor.dragHasMovedAtLeastOneFrame = false
  }

  moveKeyframesToFrameForX(xPosition, mouseMovementDirection) {
    if (!this.keyframeEditor.dragStart) return
    const xOffset = xPosition - this.keyframeEditor.dragStart
    const framesToMove = Math.round(xOffset / this.keyframeEditor.pixelsPerFrame)

    if (framesToMove !== 0) {
      this.keyframeEditor.dragHasMovedAtLeastOneFrame = true
    }

    const selectedItem = this.rootContainer.findItem(this.build.selectedIds[0])
    const sortingAlgorithm = mouseMovementDirection > 0 ? Keyframe.reverseSort : Keyframe.sort

    const selectedKeyframeIdsPerProperty = this.keyframeEditor.selectedIds.reduce((currentObj, keyframeFullId) => {
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

        const initialFrameNum = this.keyframeEditor.dragStartFrameNums[targetKeyframe.id]
        let newFrameToSet = initialFrameNum + framesToMove
        if (newFrameToSet === targetKeyframe.frame) return

        // Ensure it's actually safe to move this keyframe to that new frame
        if (newFrameToSet > this.animation.frames) {
          newFrameToSet = this.animation.frames
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

  /* Curve Editor Actions */
  setCurveRegionWidth(value) { this.curveEditor.regionWidth = value }

  setHandleIntersection(handleNum, value) {
    this.curveEditor[`handle${handleNum}Intersection`] = value
  }

  startCurveEditorDrag(vector, whichHandle) {
    this.curveEditor.dragStart = vector
    this.curveEditor.dragStartWhichHandle = whichHandle
  }

  stopCurveEditorDrag() {
    this.curveEditor.dragStart = null
    this.curveEditor.dragStartWhichHandle = null
  }

  moveKeyframeCurveHandleByIncrement(relativeMovement) {
    const whichHandle = this.curveEditor.dragStartWhichHandle
    const [_, targetKeyframes] = this.curveEditorTargets

    // Note: we do the inverse tranformation from Quadrant4 to anchor-relative position
    let toChangeX = relativeMovement.x / this.curveEditor.regionWidth
    let toChangeY = relativeMovement.y / this.curveEditor.regionWidth

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

  /* Curve Editor Computeds */
  get curveEditorTargets() {
    const emptyReturn = [false, [], '']
    if (this.keyframeEditor.dragHasMovedAtLeastOneFrame) {
      // Dragging keyframes creates jenky output in the curve editor, so disable that possibility
      return emptyReturn
    }

    const selectedKeyframeFullIds = this.keyframeEditor.selectedIds
    const numSelected = selectedKeyframeFullIds.length

    if ([1, 2].includes(numSelected) === false) {
      // We can only find a pair of keyframes when 1 or 2 is selected
      return emptyReturn
    }

    const selectedItem = this.rootContainer.findItem(this.build.selectedIds[0])

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

  /* Output Actions */
  setOutputFilename(clearIt = false) {
    if (clearIt) {
      this.project.exportFileName = ''
      return
    }

    const dateStamp = (new Date()).toISOString()
      .replaceAll('-', '')
      .replaceAll('T', '')
      .replaceAll(':', '')
      .slice(0, 12)
    const fileName = `animation-${dateStamp}.webm`
    this.project.exportFileName = fileName
  }

  export = async () => {
    // TODO [3]: Have progress output displayed Prepare-boolean, Frames-progress, video progress
    // TODO [3]: wrap this whole thing in a giant error handler

    this.animation.pause()
    this.animation.goToFirst()
    this.setSelected([])

    this.setExporting(true)
    await sleep(1) // give React a tick to render the export-canvas

    const { canvasSize } = this.rootContainer
    const prepared = prepareForExport('export-canvas', canvasSize.width, canvasSize.height, this.animation.fps)
    if (prepared) {
      await this.animation.animateForExport(exportOneFrame)
      const videoAsBlob = await exportVideo()
      downloadBlob(videoAsBlob, this.project.exportFileName)
    } else {
      // TODO [2]: tell the user that we can't export using their browser
      // do this by running prepare when we open the modal, and only enabling the button once we know
      console.warn('Error: This browser is not preparred/capable of exporting video in the way the developer wants')
    }

    this.setExporting(false)
    this.animation.goToFirst()
  }
}

export default RootStore
