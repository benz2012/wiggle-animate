import { observable, action } from 'mobx'

class Tools {
  @observable selectedKeyframe

  @action selectKeyframe = (keyframe) => {
    this.selectedKeyframe = keyframe
  }
}

export default Tools
