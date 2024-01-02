import { makeAutoObservable } from 'mobx'

class KeyHeld {
  constructor() {
    this.Space = false
    this.Shift = false
    this.Meta = false
    this.Alt = false
    this.MiddleMouse = false

    makeAutoObservable(this)
  }

  setKey(key, state) {
    this[key] = state
  }
}

export default KeyHeld
