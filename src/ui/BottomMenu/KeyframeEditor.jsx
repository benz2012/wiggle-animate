import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import CenteredMessage from './CenteredMessage'
import LineOfKeyframes from './LineOfKeyframes'
import RegionSelection from './RegionSelection'
import { LABEL_WIDTH, KEYFRAME_DIAMETER } from './config'
import { isEqual } from '../../utility/array'

const cssRotationOffset = (KEYFRAME_DIAMETER / 2)

// TODO [1]: Handle Editor
// TODO [1]: On keyframe-icon click-and-drag, move keyframe.frame (+ / -)
// TODO [2]: When hover over PlayheadCanvas, draw frame-num and vertical line over Keyframe Editor
// BUG [1]: when hovering over keyframe the timeline tick stops showing

const KeyframeEditor = observer(({ store, windowWidth }) => {
  const { build, animation, rootContainer, keyframeEditor } = store

  const { selectedIds } = build
  const selectedItem = rootContainer.findItem(selectedIds[0]) || {}
  const numSelected = selectedIds.length

  const { firstFrame: frameIn, lastFrame: frameOut } = animation
  const {
    newKeyPosition,
    hoveredProperty,
    lineWidthLessThanParent,
    handleEditorWidth,
    pixelsPerFrame,
  } = keyframeEditor

  /* Calculations to relate Mouse Position to Frame Number */
  const keyframesLineWidth = windowWidth - handleEditorWidth - LABEL_WIDTH - lineWidthLessThanParent
  const numFramesShown = frameOut - frameIn + 1
  useEffect(() => {
    store.setKeyframePixelsPerFrame(keyframesLineWidth / (numFramesShown - 1))
  }, [store, keyframesLineWidth, numFramesShown])

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
  // Prevent interactions past the frame boundaries (because we allow hovers beyond, for better UX)
  if (absoluteFrameHovered < frameIn) {
    drawNewKeyAt = 0
    absoluteFrameHovered = frameIn
  } else if (absoluteFrameHovered > frameOut) {
    drawNewKeyAt = ((numFramesShown - 1) * pixelsPerFrame)
    absoluteFrameHovered = frameOut
  }
  // Final CSS Movement Tweaks
  drawNewKeyAt -= cssRotationOffset
  /* End Calculations */

  return (
    <Box sx={{ height: 'calc(100% - 32px)', display: 'flex', mt: 1 }}>
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',

          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <RegionSelection
          frameIn={frameIn}
          frameOut={frameOut}
          setIn={animation.setIn}
          setOut={animation.setOut}
          frameHoveredAt={drawNewKeyAt + cssRotationOffset}
          absoluteFrameHovered={hoveredProperty ? absoluteFrameHovered : null}
        />

        {numSelected !== 1 && <CenteredMessage numSelected={numSelected} />}

        {numSelected === 1 && (
          <OverlayScrollbarsComponent
            options={{
              overflow: { x: 'hidden' },
              scrollbars: { theme: 'ovlyscrl-theme-custom' },
              visibility: 'visible',
            }}
            style={{
              boxShadow: 'inset 0 6px 6px -8px rgba(0, 0, 0, 1)',
              paddingTop: '4px',
              // paddingBottom accounts for the keyframe-line height and hover-line negative Y,
              // to prevent them from overflowing at the bottom of the container
              paddingBottom: 'calc(4px + 1px)',
              // This creates a consistent gap for the scrollbar, whether or not it is rendered
              paddingRight: '8px',
            }}
          >
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

              const selectedKeyIdsForThisProperty = keyframeEditor.selectedIds
                .filter((keyframeId) => keyframeId.startsWith(keyframeIdPrefix))
                .map((keyframeId) => keyframeId.split('--').pop())

              return (
                <LineOfKeyframes
                  key={keyframeIdPrefix}
                  label={keyframeLabel}
                  keyframes={property.keyframes}
                  selectedKeyIds={selectedKeyIdsForThisProperty}
                  frameIn={frameIn}
                  frameOut={frameOut}
                  pixelsPerFrame={pixelsPerFrame}
                  drawNewKeyAt={
                    (keyframeLabel === hoveredProperty && !hoveringNearExistingKeyframe)
                      ? drawNewKeyAt
                      : null
                  }
                  addKeyframe={() => {
                    if (!absoluteFrameHovered) return
                    if (hoveringNearExistingKeyframe) return
                    const newKeyframe = property.addKey(
                      absoluteFrameHovered,
                      property.getValueAtFrame(absoluteFrameHovered)
                    )
                    store.setSelectedKeyframes([`${keyframeIdPrefix}--${newKeyframe.id}`])
                  }}
                  onKeyframeClick={(keyId, setOnlyOneKey) => {
                    const keyframeId = `${keyframeIdPrefix}--${keyId}`
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
                  onKeyframeDoubleClick={(keyId) => {
                    if (keyframeEditor.selectedIds.length > 1) return
                    const keyframeId = `${keyframeIdPrefix}--${keyId}`
                    store.setSelectedKeyframes([keyframeId])
                    const keyframeClickedOn = property.keyframes.find((k) => k.id === keyId)
                    store.animation.goToFrame(keyframeClickedOn.frame)
                    const labelValue = `input-label-${property.group}-${property.label}`
                    const relatedPropertyEditorLabel = document.getElementById(labelValue)
                    if (relatedPropertyEditorLabel) {
                      relatedPropertyEditorLabel.click()
                    }
                  }}
                  onLabelClick={(visibleKeyIds, setOnlyOneLine) => {
                    const keyframeIds = visibleKeyIds.map((keyId) => `${keyframeIdPrefix}--${keyId}`)
                    if (setOnlyOneLine) {
                      if (isEqual(keyframeIds, keyframeEditor.selectedIds)) {
                        store.setSelectedKeyframes([])
                      } else {
                        store.setSelectedKeyframes(keyframeIds)
                      }
                    } else if (keyframeIds.every((kId) => keyframeEditor.selectedIds.includes(kId))) {
                      const allFrameIdsForLine = property.keyframes
                        .map((keyframe) => `${keyframeIdPrefix}--${keyframe.id}`)
                      store.removeKeyframesFromSelection(allFrameIdsForLine)
                    } else {
                      store.addKeyframesToSelection(keyframeIds)
                    }
                  }}
                />
              )
            })}
          </OverlayScrollbarsComponent>
        )}
      </Box>

      <Box
        sx={{
          width: `${handleEditorWidth}px`,
          height: '100%',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
        }}
      >
        &nbsp;
      </Box>
    </Box>
  )
})

export default KeyframeEditor
