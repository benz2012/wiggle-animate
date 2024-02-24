import { useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import CenteredMessage from './CenteredMessage'
import LineOfKeyframes from './LineOfKeyframes'
import RegionSelection from './RegionSelection'
import CurveEditorCanvas from './CurveEditorCanvas'
import theme from '../theme'
import Animation from '../../lib/animation/Animation'
import { LABEL_WIDTH, CSS_ROTATION_OFFSET } from './config'
import { isEqual } from '../../utility/array'
import { keyframeLabelFromProperty, generateDebouncedSetterAndSubmitter } from '../../utility/state'

// TODO [4]: Moving keyframes causes lots of unecessary renders, sometimes even triggeres a
//           "maximum update depth exceeded" warning in react. very hard to debug, and will
//           have serious affects whenever we upgrade to the next Mobx, for an unknown reason

const KeyframeEditor = observer(({ store, windowWidth }) => {
  const { build, animation, rootContainer, keyframeEditor } = store

  const selectedItem = rootContainer.findItem(build.selectedIds[0]) || {}
  const numSelectedItems = build.selectedIds.length

  const { firstFrame: frameIn, lastFrame: frameOut } = animation
  const {
    hoveredProperty,
    lineWidthLessThanParent,
    curveEditorWidth,
    pixelsPerFrame,
    selectedIds,
    dragStart,
  } = keyframeEditor
  const playheadHoverFrame = store.playhead.hoverLineFrame

  const keyframesLineWidth = windowWidth - curveEditorWidth - LABEL_WIDTH - lineWidthLessThanParent
  const numFramesShown = frameOut - frameIn + 1
  useEffect(() => {
    store.keyframeEditor.setPixelsPerFrame(keyframesLineWidth / (numFramesShown - 1))
  }, [store, keyframesLineWidth, numFramesShown])

  const [drawNewKeyAt, absoluteFrameHovered] = store.keyframeEditor.hoverInfo
  const frameNowLeft = (animation.now - frameIn) * pixelsPerFrame + LABEL_WIDTH + theme.spacing[1] - 0.5

  // This is guaranteed to be the two relevant to the active curve (and sorted), or null
  const [, targetKeyframes, targetKeyframeLabel] = store.curveEditor.targetKeyframeInfo

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setAndSubmitFrameIn = useCallback(generateDebouncedSetterAndSubmitter(
    store.actionStack,
    'animation.setIn',
    () => store.animation.firstFrame,
    (newValue) => store.animation.setIn(newValue),
  ), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setAndSubmitFrameOut = useCallback(generateDebouncedSetterAndSubmitter(
    store.actionStack,
    'animation.setOut',
    () => store.animation.lastFrame,
    (newValue) => store.animation.setOut(newValue),
  ), [])

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
          animationRange={[Animation.FIRST, store.animation.frames]}
          setIn={setAndSubmitFrameIn}
          setOut={setAndSubmitFrameOut}
          frameHoveredAt={drawNewKeyAt + CSS_ROTATION_OFFSET}
          absoluteFrameHovered={
            (hoveredProperty || playheadHoverFrame)
              ? absoluteFrameHovered
              : null
          }
        />

        <Box
          sx={{
            position: 'absolute',
            borderLeft: `1px solid ${theme.palette.primary[15]}`,
            height: '1000px',
            left: `${frameNowLeft}px`,
          }}
        />

        {numSelectedItems !== 1 && <CenteredMessage numSelected={numSelectedItems} />}

        {numSelectedItems === 1 && (
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
              const keyframeLabel = keyframeLabelFromProperty(property)

              const hoveringNearExistingKeyframe = (
                property.keyframes.findIndex((keyframe) => (keyframe.frame === absoluteFrameHovered)) !== -1
              )

              const selectedKeyframeIdsForThisProperty = selectedIds
                .filter((keyframeId) => keyframeId.startsWith(keyframeIdPrefix))
                .map((keyframeId) => keyframeId.split('--').pop())

              return (
                <LineOfKeyframes
                  key={keyframeIdPrefix}
                  label={keyframeLabel}
                  keyframes={property.keyframes}
                  selectedKeyframeIds={selectedKeyframeIdsForThisProperty}
                  frameIn={frameIn}
                  frameOut={frameOut}
                  pixelsPerFrame={pixelsPerFrame}
                  drawNewKeyAt={
                    (keyframeLabel === hoveredProperty && !hoveringNearExistingKeyframe && dragStart == null)
                      ? drawNewKeyAt
                      : null
                  }
                  drawCurveTargetLineWith={keyframeLabel === targetKeyframeLabel ? targetKeyframes : []}
                  addKeyframe={() => {
                    if (!absoluteFrameHovered) return
                    if (hoveringNearExistingKeyframe) return
                    const newKeyframe = property.addKey(
                      absoluteFrameHovered,
                      property.getValueAtFrame(absoluteFrameHovered)
                    )
                    store.keyframeEditor.setSelected([`${keyframeIdPrefix}--${newKeyframe.id}`])
                    store.actionStack.push({
                      perform: [
                        'keyframeEditor.pushKeyOnProperty',
                        [selectedItem.id, propName, newKeyframe.toPureObject()],
                      ],
                      revert: ['keyframeEditor.deleteKeyOnProperty', [selectedItem.id, propName, newKeyframe.id]],
                    })
                  }}
                  onKeyframePress={(keyframeId, setOnlyOneKey) => {
                    const keyframeFullId = `${keyframeIdPrefix}--${keyframeId}`
                    if (setOnlyOneKey) {
                      if (selectedIds.length <= 1) {
                        store.keyframeEditor.setSelected([keyframeFullId])
                      } else if (!selectedIds.includes(keyframeFullId)) {
                        store.keyframeEditor.setSelected([keyframeFullId])
                      }
                    } else if (selectedIds.includes(keyframeFullId)) {
                      store.keyframeEditor.removeFromSelection([keyframeFullId])
                    } else {
                      store.keyframeEditor.addToSelection([keyframeFullId])
                    }
                  }}
                  onKeyframeDoubleClick={(keyframeId) => {
                    const keyframeFullId = `${keyframeIdPrefix}--${keyframeId}`
                    store.keyframeEditor.setSelected([keyframeFullId])
                    const keyframeClickedOn = property.keyframes.find((k) => k.id === keyframeId)
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
                      if (isEqual(keyframeIds, selectedIds)) {
                        store.keyframeEditor.setSelected([])
                      } else {
                        store.keyframeEditor.setSelected(keyframeIds)
                      }
                    } else if (keyframeIds.every((kId) => selectedIds.includes(kId))) {
                      const allFrameIdsForLine = property.keyframes
                        .map((keyframe) => `${keyframeIdPrefix}--${keyframe.id}`)
                      store.keyframeEditor.removeFromSelection(allFrameIdsForLine)
                    } else {
                      store.keyframeEditor.addToSelection(keyframeIds)
                    }
                  }}
                />
              )
            })}
          </OverlayScrollbarsComponent>
        )}
      </Box>

      <CurveEditorCanvas
        store={store}
        width={curveEditorWidth}
      />
    </Box>
  )
})

export default KeyframeEditor
