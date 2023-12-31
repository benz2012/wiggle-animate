import Animation from '../lib/animation/Animation'
import RootContainer from '../lib/structure/RootContainer'

import Build from './Build'
import CurveEditor from './CurveEditor'
import KeyframeEditor from './KeyframeEditor'
import KeyHeld from './KeyHeld'
import Output from './Output'
import Playhead from './Playhead'
import Project from './Project'
import PropertyEditor from './PropertyEditor'
import Selector from './Selector'
import Stage from './Stage'
import View from './View'

class RootStore {
  constructor() {
    this.DPR = window.devicePixelRatio || 1

    this.tools = {
      NONE: '',
      PATH: 'path',
      RESIZE: 'resize',
      ROTATE: 'rotate',
    }

    this.rootContainer = new RootContainer(this)
    this.project = new Project(this)
    this.build = new Build(this)
    this.animation = new Animation(this)
    this.view = new View(this)
    this.stage = new Stage(this)
    this.output = new Output(this)

    this.selector = new Selector(this)
    this.playhead = new Playhead(this)
    this.keyHeld = new KeyHeld(this)
    this.propertyEditor = new PropertyEditor(this)
    this.keyframeEditor = new KeyframeEditor(this)
    this.curveEditor = new CurveEditor(this)
  }
}

export default RootStore
