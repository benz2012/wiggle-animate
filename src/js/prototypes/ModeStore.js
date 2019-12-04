import { observable, action } from 'mobx'

class Mode {
  @observable current
  @observable settings
  @observable clear

  constructor() {
    this.initialize()
  }

  initialize() {
    this.current = 'BUILD'
    this.settings = false
    this.clear = false
  }

  @action set = (m) => {
    this.current = m
  }
}

export default Mode
