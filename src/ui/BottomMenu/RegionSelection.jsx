import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LABEL_WIDTH } from './config'

const RegionSelection = observer(() => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
    <Box sx={{ width: `${LABEL_WIDTH}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <Typography
        className="noselect"
        component="label"
        sx={{
          display: 'inline-block',
          width: '100%',
          textAlign: 'right',
          mr: 2,
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'text.disabled',
        }}
      >
        WORK REGION
      </Typography>
    </Box>

    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>0</Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>25</Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>50</Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>75</Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>100</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={(theme) => ({
            width: '0px',
            height: '8px',
            borderRight: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            height: '0px',
            borderBottom: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            width: '0px',
            height: '8px',
            borderRight: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            height: '0px',
            borderBottom: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            width: '0px',
            height: '8px',
            borderRight: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            height: '0px',
            borderBottom: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            width: '0px',
            height: '8px',
            borderRight: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            height: '0px',
            borderBottom: `1px solid ${theme.palette.primary.main}`,
          })}
        />
        <Box
          sx={(theme) => ({
            width: '0px',
            height: '8px',
            borderRight: `1px solid ${theme.palette.primary.main}`,
          })}
        />
      </Box>
    </Box>
  </Box>
))

export default RegionSelection
