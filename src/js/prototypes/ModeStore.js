import { observable, action } from 'mobx'

class Mode {
  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @observable current = null
  @observable settings = false

  @action set = (m) => {
    this.current = m
  }
}

export default Mode
