import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const LeftRightText = ({ label, value, sx, valueNotTypography = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...sx }}>
    <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{label}</Typography>
    {valueNotTypography ? value : (
      <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{value}</Typography>
    )}
  </Box>
)

export default LeftRightText
