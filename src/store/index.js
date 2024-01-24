import Animation from '../lib/animation/Animation'
import RootContainer from '../lib/structure/RootContainer'

import ActionStack from './ActionStack'
import Build from './Build'
import CurveEditor from './CurveEditor'
import KeyframeEditor from './KeyframeEditor'
import KeyHeld from './KeyHeld'
import LeftMenu from './LeftMenu'
import Output from './Output'
import Playhead from './Playhead'
import Project from './Project'
import PropertyEditor from './PropertyEditor'
import Selector from './Selector'
import Stage from './Stage'
import Storage from './Storage'
import View from './View'

import tools from './tools'

class RootStore {
  constructor() {
    this.DPR = window.devicePixelRatio || 1
    this.tools = tools

    // Tree Strucutre, Primary State, User Edited
    this.actionStack = new ActionStack(this)
    this.rootContainer = new RootContainer(this)
    this.project = new Project(this)
    this.build = new Build(this)
    this.animation = new Animation(this)
    this.view = new View(this)
    this.stage = new Stage(this)
    this.output = new Output(this)
    this.storage = new Storage(this)

    // Transient UI State
    this.selector = new Selector(this)
    this.playhead = new Playhead(this)
    this.keyHeld = new KeyHeld(this)
    this.leftMenu = new LeftMenu(this)
    this.propertyEditor = new PropertyEditor(this)
    this.keyframeEditor = new KeyframeEditor(this)
    this.curveEditor = new CurveEditor(this)

    // Perform Last
    this.storage.initiateAutosaveLogicOnce()
  }
}

export default RootStore
