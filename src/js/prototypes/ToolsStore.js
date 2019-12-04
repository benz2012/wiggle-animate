import { observable, action } from 'mobx'

class Tools {
  @observable selectedKeyframe

  constructor() {
    this.initialize()
  }

  initialize() {
    this.selectedKeyframe = undefined
  }

  @action selectKeyframe = (keyframe) => {
    this.selectedKeyframe = keyframe
  }
}

export default Tools
