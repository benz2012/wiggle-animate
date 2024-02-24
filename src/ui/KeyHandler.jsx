/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from 'react'
import { action } from 'mobx'
import Vector2 from '../lib/structure/Vector2'
import Animation from '../lib/animation/Animation'

const ONE_UP = new Vector2(0, -1)
const ONE_DOWN = new Vector2(0, 1)
const ONE_LEFT = new Vector2(-1, 0)
const ONE_RIGHT = new Vector2(1, 0)

const TEN_UP = new Vector2(0, -10)
const TEN_DOWN = new Vector2(0, 10)
const TEN_LEFT = new Vector2(-10, 0)
const TEN_RIGHT = new Vector2(10, 0)

const doesStageHaveFocus = () => [
  'stage',
  'left-menu-container',
].includes(document.activeElement.id)

const doesBottomMenuHaveFocus = () => [
  'bottom-menu',
  'play-pause-button',
  'jump-start-button',
  'jump-end-button',
  'play-mode-button',
].includes(document.activeElement.id)

const doesAnInputFieldHaveFocus = () => document.activeElement.id.startsWith('input-')

// TODO [1]: not all hotkey actions are pushing onto actionstack

// TODO [4]: periodically check the keys in case someone scrolled away and came back and is no longer holding down
//       a meta key (or others). maybe this could be checked when window gets focused?
//       basically there is a bug now where it's stuck on the "add item to selection" cursor

const KeyHandler = ({ store }) => {
  /* -- KEY DOWN --
   * Normally we would Only place events here if they are:
   *  - Capturing a modifier key press, for use in other parts of the app
   *  - repeatable events (e.g. holding an arrow key for movement)
   *
   * But since MacOS prevents keyup events when the Meta key is held, we must capture all
   * Meta+Something key combos in keydown. Since we don't want those combos to act as repeatable events,
   * we will check for event.repeat and break if it is true. Additionally, to keep logic centralized,
   * we will capture all other Modifier+Something events here.
   */
  const handleKeyDownEvent = action((event) => {
    const STAGE_HAS_FOCUS = doesStageHaveFocus()
    const BOTTOM_HAS_FOCUS = doesBottomMenuHaveFocus()
    const INPUT_HAS_FOCUS = doesAnInputFieldHaveFocus()
    const SOME_MODIFIER_HELD = ['Meta', 'Alt', 'Shift'].some((mod) => store.keyHeld[mod])

    const { selectedIds } = store.build

    switch (event.key) {
      /* -- Meta Key Capture -- */
      case 'Meta':
      case 'Control':
        store.keyHeld.setKey('Meta', true)
        break
      case 'Alt':
        store.keyHeld.setKey('Alt', true)
        break
      case 'Shift':
        store.keyHeld.setKey('Shift', true)
        break
      case ' ':
        if (STAGE_HAS_FOCUS) {
          event.preventDefault()
        }
        store.keyHeld.setKey('Space', true)
        break

      /* -- Repeatable-while-held Events -- */
      case '-':
        if (store.keyHeld.Meta) {
          event.preventDefault()
          store.rootContainer.decrementScale()
        }
        break
      case '=':
        if (store.keyHeld.Meta) {
          event.preventDefault()
          store.rootContainer.incrementScale()
        }
        break
      case 'ArrowUp':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_UP, true)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_UP, true)
        }
        break
      case 'ArrowDown':
        if (!STAGE_HAS_FOCUS) break
        if (store.keyHeld.Shift) {
          store.rootContainer.moveAllSelectedByIncrement(TEN_DOWN, true)
        } else {
          store.rootContainer.moveAllSelectedByIncrement(ONE_DOWN, true)
        }
        break
      case 'ArrowLeft':
        if (store.keyHeld.Meta && !INPUT_HAS_FOCUS) {
          // Prevents accidental page navigation
          event.preventDefault()
        }
        if (BOTTOM_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.animation.goToFirst()
          } else {
            store.animation.goToPrev()
          }
        } else if (STAGE_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.rootContainer.moveAllSelectedByIncrement(TEN_LEFT, true)
          } else {
            store.rootContainer.moveAllSelectedByIncrement(ONE_LEFT, true)
          }
        }
        break
      case 'ArrowRight':
        if (store.keyHeld.Meta && !INPUT_HAS_FOCUS) {
          // Prevents accidental page navigation
          event.preventDefault()
        }
        if (BOTTOM_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.animation.goToLast()
          } else {
            store.animation.goToNext()
          }
        } else if (STAGE_HAS_FOCUS) {
          if (store.keyHeld.Shift) {
            store.rootContainer.moveAllSelectedByIncrement(TEN_RIGHT, true)
          } else {
            store.rootContainer.moveAllSelectedByIncrement(ONE_RIGHT, true)
          }
        }
        break

      /* -- All other events, none meant to be repeatable -- */
      case 'Backspace':
      case 'Delete':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (BOTTOM_HAS_FOCUS && store.keyframeEditor.selectedIds.length > 0) {
          const revertState = []
          const performState = []

          store.keyframeEditor.selectedIds.forEach((keyframeFullId) => {
            const [itemId, propertyName, keyframeId] = keyframeFullId.split('--')
            const item = store.rootContainer.findItem(itemId)
            const keyframe = item[propertyName].keyframes.find((k) => k.id === keyframeId)

            revertState.push([itemId, propertyName, keyframe.toPureObject()])
            performState.push([itemId, propertyName, keyframeId])

            item[propertyName].deleteKey(keyframeId)
          })
          store.keyframeEditor.setSelected([])

          store.actionStack.push({
            revert: ['keyframeEditor.pushManyKeysOnProperties', [revertState]],
            perform: ['keyframeEditor.deleteManyKeysOnProperties', [performState]],
          })
        } else if (STAGE_HAS_FOCUS && selectedIds.length > 0) {
          store.build.deleteAllSelectedWithAction()
        }
        break

      case 'Escape':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (!STAGE_HAS_FOCUS) break
        if (store.build.tool === store.tools.PATH) {
          store.stage.commitPath()
        }
        store.leftMenu.stopDrag()
        break

      case ',':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          event.preventDefault()
          store.view.openDialog('settings')
        }
        break

      case 'a':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          if (BOTTOM_HAS_FOCUS) {
            event.preventDefault()
            store.keyframeEditor.selectAllVisible()
          } else if (STAGE_HAS_FOCUS) {
            event.preventDefault()
            store.build.selectAll()
          }
        }
        break

      case 'c':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          if (BOTTOM_HAS_FOCUS) {
            event.preventDefault()
            // TODO [3]: Put Keyframe Copying Here
            //           - should be item independent, user should be able to copy-paste between items
          } else if (STAGE_HAS_FOCUS) {
            event.preventDefault()
            store.build.copySelectionToClipboard()
          }
        } else if (BOTTOM_HAS_FOCUS && !SOME_MODIFIER_HELD) {
          store.animation.setIn(Animation.FIRST)
          store.animation.setOut(store.animation.frames)
        } else if (STAGE_HAS_FOCUS && !SOME_MODIFIER_HELD) {
          store.stage.addContainer()
        }
        break

      case 'd':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          if (BOTTOM_HAS_FOCUS) {
            event.preventDefault()
            store.keyframeEditor.setSelected([])
          } else if (STAGE_HAS_FOCUS) {
            event.preventDefault()
            store.build.setSelected([])
          }
        }
        break

      case 'e':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          event.preventDefault()
          store.view.openDialog('export')
        } else if (STAGE_HAS_FOCUS && !SOME_MODIFIER_HELD) {
          store.stage.addEllipse()
        }
        break

      case 'f':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (!STAGE_HAS_FOCUS) break
        store.view.reset()
        break

      case 'i':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (!BOTTOM_HAS_FOCUS) break
        store.animation.setIn(store.animation.now)
        break

      case 'l':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (!STAGE_HAS_FOCUS) break
        store.stage.addLine()
        break

      case 'o':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          event.preventDefault()
          const inputEl = document.getElementById('input-project-file')
          inputEl.click()
        } else if (BOTTOM_HAS_FOCUS && !SOME_MODIFIER_HELD) {
          store.animation.setOut(store.animation.now)
        }
        break

      case 'p':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (!STAGE_HAS_FOCUS) break
        store.build.setTool(store.tools.PATH)
        break

      case 'r':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (!STAGE_HAS_FOCUS) break
        store.stage.addRectangle()
        break

      case 's':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          event.preventDefault()
          store.view.openDialog('save')
        }
        break

      case 't':
        if (event.repeat) break
        if (SOME_MODIFIER_HELD) break
        if (!STAGE_HAS_FOCUS) break
        store.stage.addText()
        break

      case 'v':
        // NOTE for Meta+V: Paste has it's own special listener below
        break

      case 'w':
        // NOTE for Meta+W: At least Chrome prevents overwriting this action (close browser tab)
        break

      case 'x':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          if (BOTTOM_HAS_FOCUS) {
            event.preventDefault()
            // TODO [4]: Put Keyframe Cutting Here
          } else if (STAGE_HAS_FOCUS) {
            event.preventDefault()
            store.build.copySelectionToClipboard(true)
          }
        }
        break

      case 'y':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          event.preventDefault()
          if (store.actionStack.canRedo) store.actionStack.redo()
        } else if (STAGE_HAS_FOCUS && !SOME_MODIFIER_HELD) {
          store.stage.addPolygon()
        }
        break

      case 'z':
        if (event.repeat) break
        if (store.keyHeld.Meta) {
          event.preventDefault()
          if (store.actionStack.canUndo) store.actionStack.undo()
        }
        break

      default:
        break
    }
  })

  /* -- KEY UP --
   * The only keys guaranteed to always have a keyup event are the modifier keys
   */
  const handleKeyUpEvent = action((event) => {
    const BOTTOM_HAS_FOCUS = doesBottomMenuHaveFocus()

    switch (event.key) {
      /* -- Meta Key Releases -- */
      case 'Meta':
      case 'Control':
        store.keyHeld.setKey('Meta', false)
        break
      case 'Alt':
        store.keyHeld.setKey('Alt', false)
        break
      case 'Shift':
        store.keyHeld.setKey('Shift', false)
        break
      case ' ':
        store.keyHeld.setKey('Space', false)
        if (BOTTOM_HAS_FOCUS && document.activeElement.id !== 'play-pause-button') {
          // Instead of treating the Space bar as a trigger for the Play/Pause functionality,
          // I have it focus and click the button, which gives some usability benefits
          document.getElementById('play-pause-button').focus()
          document.getElementById('play-pause-button').click()
        }
        break

      default:
        break
    }
  })

  /* -- PASTE -- */
  const handlePasteEvent = action((event) => {
    const STAGE_HAS_FOCUS = doesStageHaveFocus()
    const BOTTOM_HAS_FOCUS = doesBottomMenuHaveFocus()

    if (BOTTOM_HAS_FOCUS) {
      event.preventDefault()
      // TODO [4]: Put Keyframe Pasting Here
    } else if (STAGE_HAS_FOCUS) {
      event.preventDefault()
      const clipboardText = (event.clipboardData || window.clipboardData).getData('text')
      store.build.pasteClipboard(clipboardText)
    }
  })

  /* Memoization */
  const handleKeyDownEventMemoized = useCallback(handleKeyDownEvent, [
    store.actionStack.canRedo,
    store.actionStack.canUndo,
    store.animation.frames,
    store.animation.now,
    store.build.tool,
    JSON.stringify(store.build.selectedIds),
    JSON.stringify(store.keyframeEditor.selectedIds),
    store.keyHeld.Alt,
    store.keyHeld.Meta,
    store.keyHeld.Shift,
  ])
  const handleKeyUpEventMemoized = useCallback(handleKeyUpEvent, [])
  const handlePasteEventMemoized = useCallback(handlePasteEvent, [])

  /* Window Listener Registration */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownEventMemoized)
    return () => window.removeEventListener('keydown', handleKeyDownEventMemoized)
  }, [handleKeyDownEventMemoized])
  useEffect(() => {
    window.addEventListener('keyup', handleKeyUpEventMemoized)
    return () => window.removeEventListener('keyup', handleKeyUpEventMemoized)
  }, [handleKeyUpEventMemoized])
  useEffect(() => {
    window.addEventListener('paste', handlePasteEventMemoized)
    return () => window.removeEventListener('paste', handlePasteEventMemoized)
  }, [handlePasteEventMemoized])

  return null
}

export { doesBottomMenuHaveFocus }
export default KeyHandler
