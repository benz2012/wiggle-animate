import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'

import CenteredMessage from './CenteredMessage'
import LineOfKeyframes from './LineOfKeyframes'
import RegionSelection from './RegionSelection'

const KeyframeEditor = observer(({ store }) => {
  const { build, animation, rootContainer, keyframeEditor } = store

  const { selectedIds } = build
  const selectedItem = selectedIds.length === 1 && rootContainer.findItem(selectedIds[0])
  const numSelected = selectedIds.length

  // On region-btwn-keyframe click, add new keyframe
  // On keyframe-icon click with no drag (de-jitter), select keyframe, show handle editor
  // On keyframe-icon click-and-drag, move keyframe.frame (+ / -)
  // On keyframe-icon double-click, jump to that frame so user can edit it via Prop Editor (focus prop field)
  // On property label click, select all keyframes for that property

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
        <RegionSelection
          frameIn={animation.firstFrame}
          frameOut={animation.lastFrame}
          setIn={animation.setIn}
          setOut={animation.setOut}
        />

        {selectedItem.keyframables.map((propName) => {
          const property = selectedItem[propName]

          let keyframeLabel = `${property.group}-${property.label}`
          if (!property.group || ['transform', 'size'].includes(property.group)) {
            keyframeLabel = property.label
          }

          return (
            <LineOfKeyframes
              key={`${selectedItem.id}-${propName}`}
              label={keyframeLabel}
              keyframes={property.keyframes}
              frameIn={animation.firstFrame}
              frameOut={animation.lastFrame}
              isHovered={keyframeLabel === keyframeEditor.hoveredProperty}
              newKeyPosition={keyframeEditor.newKeyPosition}
            />
          )
        })}
      </Box>

      <Box sx={{ width: '268px', height: '100%', backgroundColor: 'primary.main' }}>&nbsp;</Box>
    </Box>
  )
})

export default KeyframeEditor
