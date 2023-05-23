import { action, makeAutoObservable } from 'mobx'

class Animation {
  static get FIRST() { return 1 }
  static get PLAYBACK_MODES() { return ['LOOP', 'ONCE'] }

  constructor() {
    // Animation timeline is always 1-to-#frames
    this.frames = 100
    // firstFrame & lastFrame are simply the viewing window
    this.firstFrame = Animation.FIRST
    this.lastFrame = this.frames

    this.fps = 30
    this.now = this.firstFrame
    this.playing = false
    this.sync = 0
    this.requestId = null
    this.mode = 'LOOP'

    makeAutoObservable(this)
  }

  setLength(newLength) {
    if (this.firstFrame > newLength) {
      this.firstFrame = Animation.FIRST
    }
    if (this.lastFrame > newLength) {
      this.lastFrame = newLength
    }
    if (this.now > newLength) {
      this.now = newLength
    }
    this.frames = newLength
  }

  setIn(frame) {
    if (frame < Animation.FIRST || frame > this.frames) return
    this.firstFrame = frame
    if (this.now < frame) {
      this.goToFrame(frame)
    }
  }

  setOut(frame) {
    if (frame < Animation.FIRST || frame > this.frames) return
    this.lastFrame = frame
    if (this.now > frame) {
      this.goToFrame(frame)
    }
  }

  nextFrame() {
    const later = this.now + 1
    if (later > this.lastFrame) {
      if (this.mode === 'LOOP') return this.firstFrame
      return null
    }
    return later
  }

  prevFrame() {
    const earlier = this.now - 1
    if (earlier < this.firstFrame) {
      if (this.mode === 'LOOP') return this.lastFrame
      return null
    }
    return earlier
  }

  play() {
    if (this.nextFrame() === null) {
      this.now = this.firstFrame
    }
    this.playing = true
    const oneCycle = action(() => {
      const nextFrame = this.nextFrame()
      if (nextFrame === null) {
        this.pause()
        return
      }
      this.now = nextFrame
    })

    this.animateAtRate(oneCycle)
  }

  pause() {
    this.playing = false
    if (this.requestId) cancelAnimationFrame(this.requestId)
  }

  goToFrame(frame) {
    if (frame < Animation.FIRST || frame > this.frames) return
    this.now = frame
  }

  goToFirst() {
    this.goToFrame(this.firstFrame)
  }

  goToLast() {
    this.goToFrame(this.lastFrame)
  }

  goToNext() {
    const nextFrame = this.nextFrame()
    if (nextFrame === null) return
    this.goToFrame(nextFrame)
  }

  goToPrev() {
    const prevFrame = this.prevFrame()
    if (prevFrame === null) return
    this.goToFrame(prevFrame)
  }

  animateAtRate(func) {
    const interval = 1000 / this.fps
    let then = Date.now()

    const loop = action(() => {
      if (this.playing === false) return
      this.requestId = requestAnimationFrame(loop)
      const now = Date.now()
      const delta = now - then
      if (delta >= interval) {
        then = now - (delta % interval)
        // TODO: this math seems wrong lol
        // Also it should be more of an average over the last second
        this.sync = Math.round(delta - interval - (delta % interval))
        func()
      }
    })
    loop()
  }

  animateForExport(exportOneFrame) {
    return new Promise((resolve) => {
      const loop = action(() => {
        exportOneFrame(this.now)

        if (this.now === this.frames) {
          resolve()
          return
        }

        const nextFrame = this.nextFrame()
        if (nextFrame === null) return

        this.now = nextFrame
        this.requestId = requestAnimationFrame(loop)
      })

      loop()
    })
  }
}

export default Animation
