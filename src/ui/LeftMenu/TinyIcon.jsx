import Box from '@mui/material/Box'
import CircleIcon from '@mui/icons-material/Circle'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import PolylineIcon from '@mui/icons-material/Polyline'
import SquareIcon from '@mui/icons-material/Square'
import TextFieldsIcon from '@mui/icons-material/TextFields'

const size10 = { width: '10px', height: '10px' }
const size16 = { width: '16px', height: '16px' }

const TinyTriangle = ({ length, color }) => (
  <Box
    sx={{
      width: 0,
      height: 0,
      borderLeft: `${(length * 4) / 7}px solid transparent`,
      borderRight: `${(length * 4) / 7}px solid transparent`,
      borderBottom: `${length}px solid ${color}`,
    }}
  />
)

const TinyIcon = ({ itemClass }) => {
  if (itemClass === 'Rectangle') {
    return <SquareIcon viewBox="4 4 16 16" sx={{ ...size10 }} />
  }
  if (itemClass === 'Ellipse') {
    return <CircleIcon viewBox="2 2 20 20" sx={{ ...size10 }} />
  }
  if (itemClass === 'Polygon') {
    return <TinyTriangle length={9} color="currentColor" />
  }
  if (itemClass === 'Line') {
    return (
      <HorizontalRuleIcon
        sx={{
          transform: 'rotate(45deg)',
          marginLeft: '-3px',
          marginRight: '-3px',
          ...size16,
        }}
      />
    )
  }
  if (itemClass === 'Text') {
    return <TextFieldsIcon viewBox="2 2 20 20" sx={{ ...size10 }} />
  }
  if (itemClass === 'Path') {
    return <PolylineIcon viewBox="2 2 20 20" sx={{ ...size10 }} />
  }
  return null
}

export default TinyIcon
