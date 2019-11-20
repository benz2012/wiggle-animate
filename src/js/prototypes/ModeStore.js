import { observable, action } from 'mobx'

class Mode {
  @observable current = null
  @observable settings = false

  @action set = (m) => {
    this.current = m
  }
}

export default Mode
