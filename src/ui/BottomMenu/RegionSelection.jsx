import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LABEL_WIDTH } from './config'

const RegionSelection = observer(() => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Typography
      className="noselect"
      component="label"
      sx={{
        width: `${LABEL_WIDTH}px`,
        fontFamily: 'monospace',
        fontSize: 12,
        color: 'text.disabled',
        cursor: 'pointer',
        '&:hover': { color: 'text.secondary' },
      }}
    >
      work region
    </Typography>

    <Box
      sx={{
        width: `calc(100% - ${LABEL_WIDTH}px)`,
        height: '8px',
        backgroundColor: 'primary.main',
      }}
    />
  </Box>
))

export default RegionSelection
