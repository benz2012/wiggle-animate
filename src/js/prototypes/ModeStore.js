import { observable, action } from 'mobx'

class Mode {
  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @observable current = null
  @observable settings = true

  @action set = (m) => {
    this.current = m
  }

  @action toggleSettings = () => {
    this.settings = !this.settings
  }
}

export default Mode
