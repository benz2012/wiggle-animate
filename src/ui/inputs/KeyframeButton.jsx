import IconButton from '@mui/material/IconButton'
import KeyIcon from '@mui/icons-material/Key'

import theme from '../theme'

const KeyframeButton = ({ frameHasKey, otherFramesHaveKeys, addKey }) => {
  let buttonColor = `${theme.palette.action.disabled}`
  if (frameHasKey) {
    buttonColor = `${theme.palette.tertiary[100]}`
  } else if (otherFramesHaveKeys) {
    buttonColor = `${theme.palette.tertiary[20]}`
  }

  return (
    <IconButton
      onClick={addKey}
      sx={{
        width: '16px',
        height: '24px',
        borderRadius: 1,

        padding: 0,
        marginLeft: '-2px',
        marginRight: '2px',

        color: buttonColor,
      }}
    >
      <KeyIcon sx={{ fontSize: '16px', transform: 'rotate(-90deg)' }} />
    </IconButton>
  )
}

export default KeyframeButton
