import React, { Component } from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import paper from 'paper'
import * as firebase from 'firebase/app'
import 'firebase/database'

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
  }

  componentDidMount() {
    // TODO: fetch state from database
    firebase.initializeApp({
      apiKey: 'AIzaSyCdglP4EAub1kYXJrXag3vaNIxxQgEZTQk',
      authDomain: 'micro-graph.firebaseapp.com',
      databaseURL: 'https://micro-graph.firebaseio.com',
      projectId: 'micro-graph',
      storageBucket: 'micro-graph.appspot.com',
      messagingSenderId: '662102370030',
      appId: '1:662102370030:web:46cfe6a252ed6cc47b75ff',
    })

    const clipsRef = firebase.database().ref('clips')

    const mapIncomingToState = incoming => ({
      key: `${simpleHash(incoming)}`,
      json: incoming,
      clip: playable(),
    })

    clipsRef.on('child_added', (data) => {
      const newClip = mapIncomingToState(data.val())
      this.setState(prevState => ({
        ...prevState,
        clips: [
          ...prevState.clips,
          newClip,
        ],
      }))
    })
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

    if (clips.length === 0) {
      return (
        <div style={{ width: '100%', padding: '10px' }}>
          <h1 style={{ marginBottom: '0px' }}>Welcome to the Gallery</h1>
        </div>
      )
    }

    return (
      <div>
        <div style={{ width: '100%', padding: '10px' }}>
          <h1 style={{ marginBottom: '0px' }}>Welcome to the Gallery</h1>
          <small>Last {clips.length} Published Animations</small>
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
