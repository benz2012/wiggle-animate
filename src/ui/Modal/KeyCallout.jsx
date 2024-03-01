import Box from '@mui/material/Box'

const KeyCallout = ({ children }) => (
  <Box
    component="span"
    sx={{
      fontFamily: 'monospace',
      fontSize: 12,
      color: 'text.disabled',
      backgroundColor: 'background.paper',
      padding: '4px',
      borderRadius: 1,
    }}
  >
    {children}
  </Box>
)

export default KeyCallout
