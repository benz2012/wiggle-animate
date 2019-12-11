import React from 'react'
import { observer } from 'mobx-react'
import paper from 'paper'

import Canvas from '../components/Canvas'

@observer
class KeyframeEditor extends React.Component {
  state = {
    previouslyClickedKeyframe: undefined,
  }

  paper = new paper.PaperScope()
  element

  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyUp)
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.item !== undefined &&
      this.props.item !== undefined &&
      prevProps.item.key !== this.props.item.key
    ) {
      this.rebuild()
    }

    if (prevProps.now !== this.props.now) {
      this.buildPlayhead()
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  keyframeEditorHasSize = () => {
    this.buildKeyframeEditorCanvas()
  }

  handleKeyframeClick = (event) => {
    event.stopPropagation()
    const { currentTarget } = event

    const { onSelect } = this.props
    const { previouslyClickedKeyframe } = this.state

    if (previouslyClickedKeyframe) {
      previouslyClickedKeyframe.strokeWidth = 0
      previouslyClickedKeyframe.shadowColor.alpha = 0
    }
    currentTarget.strokeWidth = 1
    currentTarget.shadowColor.alpha = 0.3
    onSelect(currentTarget.name)
    this.setState({ previouslyClickedKeyframe: currentTarget })
  }

  handleKeyUp = (event) => {
    const { key } = event
    const { item, keyframeKey, keyframe, onSelect } = this.props
    if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault()

      const keyframeProp = keyframeKey.split('.')[1]
      onSelect(undefined)
      item.removeKey(keyframeProp, keyframe.frame)
      this.rebuild()
    }
  }

  buildKeyframeEditorCanvas = () => {
    const { item } = this.props
    this.element = document.getElementById('keyframe-editor')
    this.paper.setup(this.element)

    const { verticalSpacing, timelineStart, timelineEnd, timelineStep } = this.timelineMath()
    let placementIndex = 0

    const { playheadLine } = this.buildPlayhead()
    const newKeyframeItems = []

    Object.entries(item.keyframes).forEach(([prop, list]) => {
      let propName = prop
      const placing = placementIndex * verticalSpacing + verticalSpacing

      if (prop === 'y') return // Interpret `x` & `y` at the same time
      if (prop === 'x') {
        propName = 'position'
      }

      // Draw Timelines
      new this.paper.PointText({
        point: [0, placing],
        content: propName,
        fillColor: 'black',
        fontSize: 14,
      })
      const timelineHover = new this.paper.Path.Line({
        name: 'timelineHover',
        from: [timelineStart + 5, placing - 5],
        to: [timelineEnd, placing - 5],
        strokeColor: 'rgba(180, 180, 180, 1)',
        strokeWidth: 40,
      })
      const timeline = new this.paper.Path.Line({
        from: [timelineStart + 5, placing - 5],
        to: [timelineEnd, placing - 5],
        strokeColor: 'lightgrey',
        strokeWidth: 4,
      })

      const newKeyframeRect = new this.paper.Path.Rectangle({
        name: 'newKeyframeRect',
        point: [0, placing - 10],
        size: [10, 10],
        radius: 3,
        fillColor: 'rgba(31, 155, 255, 0.5)',
        rotation: 45,
        visible: false,
      })
      const newKeyframePlus = new this.paper.PointText({
        point: [0, placing - 8],
        content: '+',
        fillColor: 'rgba(31, 155, 255, 0.5)',
        fontSize: 14,
        visible: false,
      })

      newKeyframeItems.push([timelineHover, newKeyframeRect, newKeyframePlus])

      // TODO: Put these all in a group, including the playheadsegment, and apply one event
      const newKeyframeHoverEffect = (event) => {
        newKeyframeRect.visible = true
        newKeyframePlus.visible = true
        newKeyframeRect.position.x = event.point.x
        newKeyframePlus.position.x = event.point.x + 10
      }
      const newKeyframeHide = () => {
        newKeyframeRect.visible = false
        newKeyframePlus.visible = false
      }
      const newKeyClick = (event) => {
        const frame = Math.round((event.point.x - timelineStart) / timelineStep)
        item.addKey(prop, frame)
        this.rebuild()
      }

      timelineHover.onMouseMove = newKeyframeHoverEffect
      timelineHover.onMouseLeave = newKeyframeHide
      timeline.onMouseMove = newKeyframeHoverEffect
      timeline.onMouseLeave = newKeyframeHide

      newKeyframeRect.onMouseMove = (event) => {
        if (timelineHover.hitTest(event.point, { stroke: true, segments: false })) {
          newKeyframeHoverEffect(event)
        } else {
          newKeyframeHide()
        }
      }

      timelineHover.onClick = newKeyClick
      timeline.onClick = newKeyClick
      newKeyframeRect.onClick = newKeyClick

      // Draw Keyframes
      list.forEach((keyframe, keyframeIndex) => {
        const keyframeRect = new this.paper.Path.Rectangle({
          name: `${item.key}.${prop}.${keyframeIndex}`,
          point: [timelineStart + keyframe.frame * timelineStep - 5, placing - 10],
          size: [10, 10],
          radius: 3,
          fillColor: 'rgb(30, 155, 255)',
          rotation: 45,
          strokeColor: 'white',
          strokeWidth: 0,
          shadowColor: 'rgba(0, 0, 0, 0)',
          shadowBlur: 5,
        })

        keyframeRect.on('mousedown', this.handleKeyframeClick)
        keyframeRect.onMouseEnter = () => {
          this.element.style.cursor = 'pointer'
          newKeyframeHide()
        }
        keyframeRect.onMouseLeave = () => {
          this.element.style.cursor = 'default'
        }
      })

      placementIndex += 1
    })

    playheadLine.onMouseMove = (event) => {
      newKeyframeItems.forEach(([
        timelineHover,
        newKeyframeRect,
        newKeyframePlus,
      ]) => {
        if (timelineHover.hitTest(event.point)) {
          /* eslint-disable no-param-reassign */
          newKeyframeRect.visible = true
          newKeyframePlus.visible = true
          newKeyframeRect.position.x = event.point.x
          newKeyframePlus.position.x = event.point.x + 10
        } else {
          newKeyframeRect.visible = false
          newKeyframePlus.visible = false
        }
      })
    }
    playheadLine.bringToFront()
  }

  rebuild() {
    this.paper.project.clear()
    this.paper.project.remove()
    this.buildKeyframeEditorCanvas()
  }

  buildPlayhead() {
    const { size, now } = this.props
    const { timelineStart, timelineStep } = this.timelineMath()
    const playheadLine = new this.paper.Path.Line({
      from: [timelineStart + now * timelineStep, 10],
      to: [timelineStart + now * timelineStep, size.height - 10],
      strokeColor: 'white',
      strokeWidth: 1,
    })
    const playheadTriangle = new this.paper.Path.RegularPolygon({
      center: [timelineStart + now * timelineStep, 10],
      sides: 3,
      radius: 6,
      rotation: 180,
      fillColor: 'white',
    })
    return { playheadLine, playheadTriangle }
  }

  timelineMath() {
    const { size, frames } = this.props
    const verticalSpacing = 40
    const timelineStart = 80
    const timelineEnd = size.width - verticalSpacing
    const timelineWidth = timelineEnd - timelineStart
    const timelineStep = timelineWidth / frames
    return {
      verticalSpacing,
      timelineStart,
      timelineEnd,
      timelineWidth,
      timelineStep,
    }
  }

  render() {
    const { size, item } = this.props

    if (size === undefined || item === undefined) {
      return (
        <h3 style={{ padding: '10px', color: 'grey' }}>
          Select an Item to view its Keyframes.
        </h3>
      )
    }

    return (
      <div style={{ padding: '10px' }}>
        <Canvas
          id="keyframe-editor"
          width={size.width}
          height={size.height}
          hasSize={this.keyframeEditorHasSize}
        />
      </div>
    )
  }
}

export default KeyframeEditor
