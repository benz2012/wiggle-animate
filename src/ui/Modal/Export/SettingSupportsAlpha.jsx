import Box from '@mui/material/Box'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Typography from '@mui/material/Typography'

import ProjectSettingText from './ProjectSettingText'

const SettingSupportsAlpha = ({ value }) => (
  <ProjectSettingText
    label="Supports Alpha"
    valueNotTypography
    value={(
      <Box sx={{ marginTop: 1, display: 'flex', height: '100%', alignItems: 'center' }}>
        {value ? (
          <>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              Yes
            </Typography>
            <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 16 }} />
          </>
        ) : (
          <>
            <Typography sx={{ color: 'error.main', fontFamily: 'monospace', fontSize: 12 }}>
              No
            </Typography>
            <HighlightOffIcon sx={{ color: 'error.main', marginLeft: 1, fontSize: 16 }} />
          </>
        )}
      </Box>
    )}
  />
)

export default SettingSupportsAlpha
