import { observable, action } from 'mobx'

class Animation {
  static get FIRST() { return 1 }
  static get PLAYBACK_MODES() { return ['LOOP', 'ONCE'] }

  @observable frames
  @observable firstFrame
  @observable lastFrame
  @observable fps
  @observable now
  @observable playing
  @observable sync
  @observable requestId
  @observable mode

  constructor() {
    this.initialize()
  }

  initialize() {
    this.frames = 100
    this.firstFrame = Animation.FIRST
    this.lastFrame = 100
    this.fps = 30
    this.now = this.firstFrame
    this.playing = false
    this.sync = 0
    this.requestId = null
    this.mode = 'LOOP'
  }

  toJSON() {
    return ({
      frames: this.frames,
      firstFrame: this.firstFrame,
      lastFrame: this.lastFrame,
      fps: this.fps,
      mode: this.mode,
    })
  }

  @action setLength(length) {
    this.frames = length
    if (length < this.lastFrame) {
      this.lastFrame = length
    }
  }

  @action setIn = (f) => {
    if (f < Animation.FIRST || f > this.frames) return
    this.firstFrame = f
    if (this.now < f) {
      this.goToFrame(f)
    }
  }

  @action setOut = (f) => {
    if (f < Animation.FIRST || f > this.frames) return
    this.lastFrame = f
    if (this.now > f) {
      this.goToFrame(f)
    }
  }

  nextFrame = () => {
    const later = this.now + 1
    if (later > this.lastFrame) {
      if (this.mode === 'LOOP') return this.firstFrame
      return null
    }
    return later
  }

  prevFrame = () => {
    const earlier = this.now - 1
    if (earlier < this.firstFrame) {
      if (this.mode === 'LOOP') return this.lastFrame
      return null
    }
    return earlier
  }

  @action play = () => {
    if (this.nextFrame() === null) return
    this.playing = true
    this.animateAtRate(() => {
      const nextFrame = this.nextFrame()
      if (nextFrame === null) return this.pause()
      this.now = nextFrame
    })
  }

  @action pause = () => {
    this.playing = false
    if (this.requestId) cancelAnimationFrame(this.requestId)
  }

  @action goToFrame = (frame) => {
    this.now = frame
  }

  @action goToFirst = () => {
    this.goToFrame(this.firstFrame)
  }

  @action goToLast = () => {
    this.goToFrame(this.lastFrame)
  }

  @action goToNext = () => {
    const nextFrame = this.nextFrame()
    if (nextFrame === null) return
    this.goToFrame(nextFrame)
  }

  @action goToPrev = () => {
    const prevFrame = this.prevFrame()
    if (prevFrame === null) return
    this.goToFrame(prevFrame)
  }

  @action animateAtRate = (func) => {
    const interval = 1000 / this.fps
    let then = Date.now()

    const loop = () => {
      if (this.playing === false) return
      this.requestId = requestAnimationFrame(loop)
      const now = Date.now()
      const delta = now - then
      if (delta >= interval) {
        then = now - (delta % interval)
        this.sync = Math.round(delta - interval - (delta % interval))
        func()
      }
    }
    loop()
  }
}

export default Animation
