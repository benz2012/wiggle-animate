import { action, makeAutoObservable } from 'mobx'

import { timeStampMicro } from '../../utility/time'

// NOTE: "Animation" now conflicts with the Web Animations API, but I currently have no use for that.
// Since this causes the IDE to think that Animation is in the namespace, even if its not imported,
// keep that in mind or you'll be calling on undefined properties (e.g. Animation.FIRST)

// TODO [4]: Maybe move this into store since it fits more naturally over there -- it's not part of "the tree"

class Animation {
  static get FIRST() { return 1 }
  static get PLAYBACK_MODES() { return { LOOP: 'LOOP', ONCE: 'ONCE' } }
  static get RATES() { return [24.0, 29.97, 30.0, 59.94, 60.0] }
  static get INITIAL() {
    return {
      frames: 100,
      fps: 30,
      playing: false,
    }
  }

  constructor(store) {
    this.store = store

    // Animation timeline is always 1-to-#frames
    this.frames = Animation.INITIAL.frames
    // firstFrame & lastFrame are simply the viewing window
    this.firstFrame = Animation.FIRST
    this.lastFrame = this.frames

    this.fps = Animation.INITIAL.fps
    this.now = this.firstFrame
    this.playing = Animation.INITIAL.playing
    this.sync = []
    this.requestId = null
    this.mode = Animation.PLAYBACK_MODES.LOOP

    makeAutoObservable(this)
  }

  setLength(newLength) {
    if (this.firstFrame > newLength) {
      this.firstFrame = Animation.FIRST
    }
    if (this.lastFrame > newLength || this.lastFrame === this.frames) {
      this.lastFrame = newLength
    }
    if (this.now > newLength) {
      this.now = newLength
    }
    this.frames = newLength
  }

  setRate(newRate) {
    if (!Animation.RATES.includes(newRate)) return
    this.fps = newRate
  }

  setIn = (frame) => {
    if (frame < Animation.FIRST || frame > this.frames) return
    if (frame >= this.lastFrame) {
      // prevent 1-frame and negative work region by clearing the "out"
      this.lastFrame = this.frames
    }
    this.firstFrame = frame
    if (this.now < frame) {
      this.goToFrame(frame)
    }
  }

  setOut = (frame) => {
    if (frame < Animation.FIRST || frame > this.frames) return
    if (frame <= this.firstFrame) {
      // prevent 1-frame and negative work region by clearing the "in"
      this.firstFrame = 1
    }
    this.lastFrame = frame
    if (this.now > frame) {
      this.goToFrame(frame)
    }
  }

  nextFrame() {
    const later = this.now + 1
    if (later > this.lastFrame) {
      if (this.mode === Animation.PLAYBACK_MODES.LOOP) return this.firstFrame
      return null
    }
    return later
  }

  prevFrame() {
    const earlier = this.now - 1
    if (earlier < this.firstFrame) {
      if (this.mode === Animation.PLAYBACK_MODES.LOOP) return this.lastFrame
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

    this.animateAtFrameRate(oneCycle)
  }

  pause() {
    this.playing = false
    if (this.requestId) cancelAnimationFrame(this.requestId)
    this.sync = []
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

  animateAtFrameRate(animationFunction) {
    const targetDelta = 1000 / this.fps
    let previousTimeStamp

    const step = action(() => {
      if (this.playing === false) return

      const currentTimeStamp = timeStampMicro()
      if (previousTimeStamp === undefined) {
        previousTimeStamp = currentTimeStamp
      }
      const timeDelta = currentTimeStamp - previousTimeStamp

      // Calculate the FPS of this one Frame, push it on the sync array, but cap the sync array length to the number
      // of values that would theoretically exist in 1 second if the past N-values all shared the same actualFPS.
      // This will then allow taking an average of actualFPS over "allegedly" 1 second.
      let actualFPS = this.fps
      if (timeDelta > targetDelta) {
        actualFPS = 1000 / timeDelta
      }
      this.sync.push(actualFPS)
      this.sync = this.sync.slice(0, parseInt(actualFPS, 10))

      // Wait until we've gotten as close as possible to Expected FPS before drawing & continuing
      const waitBeforeStepping = Math.max(targetDelta - timeDelta, 0)
      const browserIntroducedLoopDelay = 0.6667 // found via trial and error
      const timeStampToWaitUntil = (timeStampMicro() + waitBeforeStepping) - browserIntroducedLoopDelay
      while (timeStampMicro() < timeStampToWaitUntil) { /* PASS */ }

      previousTimeStamp = timeStampMicro()
      animationFunction()
      this.requestId = requestAnimationFrame(step)
    })

    this.requestId = requestAnimationFrame(step)
  }

  animateForExport(exportOneFrameAsync) {
    let exportFrameNum = 1
    return new Promise((resolve) => {
      const loop = async () => {
        this.store.rootContainer.updatePropertiesForFrame(exportFrameNum)

        const canvasEl = document.getElementById('export-canvas')
        const ctx = canvasEl.getContext('2d')
        this.store.rootContainer.drawForExport(ctx, canvasEl.width, canvasEl.height)

        await exportOneFrameAsync(exportFrameNum)

        if (exportFrameNum === this.frames) {
          resolve()
          return
        }

        exportFrameNum += 1
        loop()
      }

      loop()
    })
  }

  toPureObject() {
    return {
      frames: this.frames,
      firstFrame: this.firstFrame,
      lastFrame: this.lastFrame,
      fps: this.fps,
      now: this.now,
      mode: this.mode,
    }
  }

  fromPureObject({ frames, firstFrame, lastFrame, fps, now, mode }) {
    this.frames = frames
    this.firstFrame = firstFrame
    this.lastFrame = lastFrame
    this.fps = fps
    this.now = now
    this.mode = mode
  }
}

export default Animation
