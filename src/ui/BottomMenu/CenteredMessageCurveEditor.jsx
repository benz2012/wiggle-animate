import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const CenteredMessageCurveEditor = () => (
  <Box
    className="noselect"
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 2,
      paddingRight: 2,
    }}
  >
    <Typography
      color="action.disabled"
      sx={{ textTransform: 'uppercase', letterSpacing: 0.75, textAlign: 'center' }}
    >
      Select a Keyframe Pair
    </Typography>
  </Box>
)

export default CenteredMessageCurveEditor
