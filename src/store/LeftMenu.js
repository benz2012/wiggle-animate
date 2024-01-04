import { makeAutoObservable } from 'mobx'

class LeftMenu {
  constructor() {
    this.hoveredId = null

    makeAutoObservable(this)
  }

  setHovered(value) { this.hoveredId = value }
}

export default LeftMenu
