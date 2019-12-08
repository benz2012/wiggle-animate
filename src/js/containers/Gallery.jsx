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
    width: undefined,
    height: undefined,
  }

  componentDidMount() {
    const container = document.getElementById('playback-container')
    const width = Math.round(container.clientWidth) - 20
    const height = Math.round((9 / 16) * width)
    this.setState({ width, height })


    const { clipsRef } = this.props
    clipsRef.on('child_added', (data) => {
      const newClip = {
        key: `${simpleHash(data.val())}`,
        json: data.val(),
        clip: playable(),
      }

      this.setState((prevState) => {
        const firstClip = prevState.clips[0]
        if (firstClip) {
          return ({
            clips: [
              firstClip,
              newClip,
              ...prevState.clips.slice(1),
            ],
          })
        }
        return ({ clips: [newClip] })
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height, clips } = this.state
    const prevClipsLen = prevState.clips.length
    if (clips.length > prevClipsLen) {
      const targetIndex = prevClipsLen === 0 ? 0 : 1
      clips[targetIndex].clip.canvas.setSize(width, height)
      reaction(
        () => ([
          clips[targetIndex].clip.animation.now,
        ]),
        () => clips[targetIndex].clip.canvas.draw()
      )
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
        <div style={{ width: '100%', padding: '10px', position: 'fixed', backgroundColor: 'white', zIndex: '100' }}>
          <h1 style={{ marginBottom: '0px' }}>Welcome to the Gallery</h1>
          <small>{clips.length} Published Animations, scroll to see them!</small>
        </div>

        <div id="playback-container" style={{ width: '100%', padding: '0px 10px', paddingTop: '100px' }}>
          {clips.length === 0 ? (
            <p>Loading Clips...</p>
          ) : (
            clips.map(({ clip, key, json }) => (
              <div key={key} style={{ padding: '10px 0px' }}>
                <h4 style={{ marginBottom: '4px' }}>{clip.project.name}</h4>
                <CanvasEl
                  id={`paper-canvas-${key}`}
                  width={clip.canvas.width}
                  height={clip.canvas.height}
                  hasSize={this.canvasHasSize(key, clip, json)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    )
  }
}

export default Gallery
