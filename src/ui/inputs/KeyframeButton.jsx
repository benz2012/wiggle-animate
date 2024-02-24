import IconButton from '@mui/material/IconButton'
import StopRounded from '@mui/icons-material/StopRounded'

import { ReactComponent as AddKeyIcon } from '../../assets/add-keyframe.svg'
import theme from '../theme'

const KeyframeButton = ({ frameHasKey, otherFramesHaveKeys, toggleKeyframe }) => {
  let buttonColor = `${theme.palette.action.disabled}`
  let buttonIcon = <AddKeyIcon style={{ width: '12px', height: '12px' }} />

  if (frameHasKey) {
    buttonColor = `${theme.palette.tertiary[100]}`
    buttonIcon = <StopRounded sx={{ fontSize: '16px', transform: 'rotate(45deg)' }} />
  } else if (otherFramesHaveKeys) {
    buttonColor = `${theme.palette.tertiary[50]}`
  }

  return (
    <IconButton
      onClick={toggleKeyframe}
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
      {buttonIcon}
    </IconButton>
  )
}

export default KeyframeButton
