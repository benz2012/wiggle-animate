import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

import CenteredMessage from './CenteredMessage'
import LineOfKeyframes from './LineOfKeyframes'
import RegionSelection from './RegionSelection'
import { LABEL_WIDTH, KEYFRAME_DIAMETER } from './config'
import { isEqual } from '../../utility/array'

const cssRotationOffset = (KEYFRAME_DIAMETER / 2)

// TODO [1]: Handle Editor
// On keyframe-icon click-and-drag, move keyframe.frame (+ / -)
// show working range outside of selected item, and lock it as a header
// add always-on scroll bar so that the space is dedicated
// allow panel height to be edited slightly with a click-&-drag

const KeyframeEditor = observer(({ store }) => {
  const { build, animation, rootContainer, keyframeEditor } = store

  const { selectedIds } = build
  const selectedItem = selectedIds.length === 1 && rootContainer.findItem(selectedIds[0])
  const numSelected = selectedIds.length

  const { firstFrame: frameIn, lastFrame: frameOut } = animation
  const { newKeyPosition, hoveredProperty } = keyframeEditor

  /* Calculations to relate Mouse Position to Frame Number */
  const widthCheckerRef = useRef()
  const numFramesShown = frameOut - frameIn + 1
  const pixelsPerFrame = widthCheckerRef.current ? (
    (widthCheckerRef.current.clientWidth - LABEL_WIDTH) / (numFramesShown - 1)
  ) : 0
  const theme = useTheme()
  const leftOffsetStr = theme.spacing(1)
  const leftOffset = parseInt(leftOffsetStr.substring(0, leftOffsetStr.length - 2), 10)
  const uxFeelingOffset = 3
  // Start with a comfortable position in relation to the mouse
  let drawNewKeyAt = newKeyPosition - cssRotationOffset - leftOffset + uxFeelingOffset
  // Snapping to Frames
  drawNewKeyAt = Math.floor((drawNewKeyAt + pixelsPerFrame / 2) / pixelsPerFrame) * pixelsPerFrame
  // Convert to Frame Number
  const relativeFrameHovered = Math.round(drawNewKeyAt / pixelsPerFrame)
  let absoluteFrameHovered = frameIn + relativeFrameHovered
  // Final CSS Movement Tweaks
  drawNewKeyAt -= cssRotationOffset
  // Prevent interactions past the frame boundaries (because we allow hovers beyond, for better UX)
  if (absoluteFrameHovered < frameIn || absoluteFrameHovered > frameOut) {
    drawNewKeyAt = null
    absoluteFrameHovered = null
  }
  /* End Calculations */

  if (numSelected !== 1) {
    return <CenteredMessage numSelected={numSelected} />
  }

  return (
    <Box sx={{ height: 'calc(100% - 32px)', display: 'flex', mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          pr: 1,
          overflow: 'scroll',
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <Box ref={widthCheckerRef} sx={{ flexGrow: 1 }} />
        </Box>

        <RegionSelection
          frameIn={frameIn}
          frameOut={frameOut}
          setIn={animation.setIn}
          setOut={animation.setOut}
          frameHoveredAt={drawNewKeyAt + cssRotationOffset}
          absoluteFrameHovered={absoluteFrameHovered}
        />

        {selectedItem.keyframables.map((propName) => {
          const property = selectedItem[propName]
          const keyframeIdPrefix = `${selectedItem.id}--${propName}`

          let keyframeLabel = `${property.group}-${property.label}`
          if (!property.group || ['transform', 'size'].includes(property.group)) {
            keyframeLabel = property.label
          }

          const hoveringNearExistingKeyframe = (
            property.keyframes.findIndex((keyframe) => (keyframe.frame === absoluteFrameHovered)) !== -1
          )

          const selectedFramesForThisProperty = keyframeEditor.selectedIds
            .filter((keyframeId) => keyframeId.startsWith(keyframeIdPrefix))
            .map((keyframeId) => parseInt(keyframeId.split('--').pop(), 10))

          return (
            <LineOfKeyframes
              key={keyframeIdPrefix}
              label={keyframeLabel}
              keyframes={property.keyframes}
              selectedFrames={selectedFramesForThisProperty}
              frameIn={frameIn}
              frameOut={frameOut}
              pixelsPerFrame={pixelsPerFrame}
              drawNewKeyAt={(keyframeLabel === hoveredProperty && !hoveringNearExistingKeyframe) ? drawNewKeyAt : null}
              addKeyframe={() => {
                if (!absoluteFrameHovered) return
                if (hoveringNearExistingKeyframe) return
                const newKeyframe = property.addKey(
                  absoluteFrameHovered,
                  property.getValueAtFrame(absoluteFrameHovered)
                )
                store.setSelectedKeyframes([`${keyframeIdPrefix}--${newKeyframe.frame}`])
              }}
              onKeyframeClick={(frame, setOnlyOneKey) => {
                const keyframeId = `${keyframeIdPrefix}--${frame}`
                if (setOnlyOneKey) {
                  if (keyframeEditor.selectedIds.length === 1 && keyframeEditor.selectedIds.includes(keyframeId)) {
                    store.setSelectedKeyframes([])
                  } else {
                    store.setSelectedKeyframes([keyframeId])
                  }
                } else if (keyframeEditor.selectedIds.includes(keyframeId)) {
                  store.removeKeyframeFromSelection(keyframeId)
                } else {
                  store.addKeyframeToSelection(keyframeId)
                }
              }}
              onKeyframeDoubleClick={(frame) => {
                if (keyframeEditor.selectedIds.length > 1) return
                const keyframeId = `${keyframeIdPrefix}--${frame}`
                store.setSelectedKeyframes([keyframeId])
                store.animation.goToFrame(frame)
                const labelValue = `input-label-${property.group}-${property.label}`
                const relatedPropertyEditorLabel = document.getElementById(labelValue)
                if (relatedPropertyEditorLabel) {
                  relatedPropertyEditorLabel.click()
                }
              }}
              onLabelClick={(visibleFrames, setOnlyOneLine) => {
                const keyframeIds = visibleFrames.map((frame) => `${keyframeIdPrefix}--${frame}`)
                if (setOnlyOneLine) {
                  if (isEqual(keyframeIds, keyframeEditor.selectedIds)) {
                    store.setSelectedKeyframes([])
                  } else {
                    store.setSelectedKeyframes(keyframeIds)
                  }
                } else if (keyframeIds.every((kId) => keyframeEditor.selectedIds.includes(kId))) {
                  const allFrameIdsForLine = property.keyframes
                    .map((keyframe) => `${keyframeIdPrefix}--${keyframe.frame}`)
                  store.removeKeyframesFromSelection(allFrameIdsForLine)
                } else {
                  store.addKeyframesToSelection(keyframeIds)
                }
              }}
            />
          )
        })}
      </Box>

      <Box sx={{ width: '268px', height: '100%', backgroundColor: 'primary.main' }}>&nbsp;</Box>
    </Box>
  )
})

export default KeyframeEditor
