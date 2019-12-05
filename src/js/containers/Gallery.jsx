import React, { Component } from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import paper from 'paper'

import CanvasEl from '../components/Canvas'

import Project from '../prototypes/Project'
import Canvas from '../prototypes/Canvas'
import Animation from '../prototypes/Animation'
import Keyframe from '../prototypes/Keyframe'
import items from '../prototypes/items'

import { simpleHash } from '../util/string'

import input1 from '../../json/gallery_input_1.json'

const playable = () => {
  const obj = {}
  obj.paper = new paper.PaperScope()
  obj.project = new Project(obj)
  obj.canvas = new Canvas(obj)
  obj.animation = new Animation()
  return obj
}

@observer
class Gallery extends Component {
  state = {
    clips: [],
  }

  componentDidMount() {
    // TODO: fetch state from database
    const response = [input1].map(obj => JSON.stringify(obj))
    const initialClips = response.map(json => ({
      key: `${simpleHash(json)}`,
      json,
      clip: playable(),
    }))
    this.setState({ clips: initialClips })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.clips.length === 0 && this.state.clips.length !== 0) {
      const container = document.getElementById('playback-container')
      setTimeout(() => {
        const width = Math.round(container.clientWidth) - 20
        const height = Math.round((9 / 16) * width)
        this.state.clips.forEach(({ clip }) => {
          clip.canvas.setSize(width, height)
        })
      })

      this.state.clips.forEach(({ clip }) => {
        reaction(
          () => ([
            clip.animation.now,
          ]),
          () => clip.canvas.draw()
        )
      })
    }
  }

  canvasHasSize = (key, clip, json) => () => {
    clip.canvas.attatchAndSetup(`paper-canvas-${key}`)
    clip.canvas.build()
    clip.project.load(json)
    this.buildAnimatables(clip)
    clip.animation.play()
  }

  buildAnimatables = (clip) => {
    Object.entries(clip.project.inputItems).forEach(([itemKey, itemObj]) => {
      const { class: itemClass, keyframes, ...properties } = itemObj

      const animatable = new items[itemClass](itemKey)
      clip.canvas.add(animatable)

      const inputKeyframes = Object.entries(keyframes)
        .reduce((accum, [keyframeProp, keyframeList]) => {
          /* eslint no-param-reassign: 0 */
          accum[keyframeProp] = keyframeList.map(Keyframe.fromJSON)
          return accum
        }, {})
      animatable.keyframes = {
        ...this.keyframes,
        ...inputKeyframes,
      }

      Object.entries(properties).forEach(([key, value]) => {
        animatable[key] = value
      })
    })

    clip.canvas.deselect()
    clip.canvas.draw()
  }

  render() {
    const { clips } = this.state

    return (
      <div>
        <div style={{ width: '100%', padding: '10px' }}>
          <h1 style={{ marginBottom: '0px' }}>Welcome to the Gallery</h1>
          <small>Last {clips.length} Published Animations</small>
        </div>

        <div style={{ width: '100%', padding: '10px' }}>
          <h3><em>This page doesn't work yet, I still need to build it. Please don't try to <strong>publish</strong> anything yet</em></h3>
        </div>

        <div id="playback-container" style={{ width: '100%', padding: '0px 10px' }}>
          {clips.map(({ clip, key, json }) => (
            <div key={key} style={{ padding: '10px 0px' }}>
              <CanvasEl
                id={`paper-canvas-${key}`}
                width={clip.canvas.width}
                height={clip.canvas.height}
                hasSize={this.canvasHasSize(key, clip, json)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default Gallery
