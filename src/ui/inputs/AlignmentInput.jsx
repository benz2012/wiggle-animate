import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import AnchorIcon from '@mui/icons-material/Anchor'

import InputLabel from './InputLabel'
import Alignment from '../../lib/structure/Alignment'

const AlignmentCheckbox = ({ label, checked, onChange }) => (
  <Checkbox
    inputProps={{ 'aria-label': label }}
    checkedIcon={<AnchorIcon />}
    checked={checked}
    onChange={onChange}
    size="4px"
    sx={{
      color: 'action.disabled',
      '&.MuiCheckbox-root': {
        fontSize: '20px',
        lineHeight: '20px',
        padding: '0px',
        margin: 'none',
      },
    }}
  />
)

const AlignmentInput = observer(({
  label,
  targetProperty,
  setPropertyValue,
}) => {
  // TODO [4]: Add a question mark that when clicked opens a modal and explains the
  //       differences between alignment and origin with a little Gif animating the difference

  const { x, y } = targetProperty.value

  let selectedAlignmentXNum = 0 // Represents LEFT
  if (x === Alignment.CENTER) {
    selectedAlignmentXNum = 1
  }
  if (x === Alignment.RIGHT) {
    selectedAlignmentXNum = 2
  }

  let selectedAlignmentYNum = 0 // Represents TOP
  if (y === Alignment.CENTER) {
    selectedAlignmentYNum = 1
  }
  if (y === Alignment.BOTTOM) {
    selectedAlignmentYNum = 2
  }

  const selectedAlignmentNum = selectedAlignmentXNum + selectedAlignmentYNum * 3

  const handleCheckboxClick = (alignmentNum) => () => {
    const xAlignmentNum = alignmentNum % 3
    const yAlignmentNum = parseInt(alignmentNum / 3, 10)
    const xAlignment = [Alignment.LEFT, Alignment.CENTER, Alignment.RIGHT][xAlignmentNum]
    const yAlignment = [Alignment.TOP, Alignment.CENTER, Alignment.BOTTOM][yAlignmentNum]
    setPropertyValue([xAlignment, yAlignment])
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <InputLabel label={label} />

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AlignmentCheckbox
            label="set alignment top left"
            checked={selectedAlignmentNum === 0}
            onChange={handleCheckboxClick(0)}
          />
          <AlignmentCheckbox
            label="set alignment top center"
            checked={selectedAlignmentNum === 1}
            onChange={handleCheckboxClick(1)}
          />
          <AlignmentCheckbox
            label="set alignment top right"
            checked={selectedAlignmentNum === 2}
            onChange={handleCheckboxClick(2)}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AlignmentCheckbox
            label="set alignment center left"
            checked={selectedAlignmentNum === 3}
            onChange={handleCheckboxClick(3)}
          />
          <AlignmentCheckbox
            label="set alignment center center"
            checked={selectedAlignmentNum === 4}
            onChange={handleCheckboxClick(4)}
          />
          <AlignmentCheckbox
            label="set alignment center right"
            checked={selectedAlignmentNum === 5}
            onChange={handleCheckboxClick(5)}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AlignmentCheckbox
            label="set alignment bottom left"
            checked={selectedAlignmentNum === 6}
            onChange={handleCheckboxClick(6)}
          />
          <AlignmentCheckbox
            label="set alignment bottom center"
            checked={selectedAlignmentNum === 7}
            onChange={handleCheckboxClick(7)}
          />
          <AlignmentCheckbox
            label="set alignment bottom right"
            checked={selectedAlignmentNum === 8}
            onChange={handleCheckboxClick(8)}
          />
        </Box>
      </Box>
    </Box>
  )
})

export default AlignmentInput
