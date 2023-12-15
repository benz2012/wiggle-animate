import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const CenteredMessage = ({ numSelected }) => {
  let text = ''
  if (numSelected === 0) {
    text = 'Select an item'
  } else if (numSelected > 1) {
    text = 'Select only one item'
  }
  return (
    <Box
      className="noselect"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        color="action.disabled"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.75 }}
      >
        {text}
      </Typography>
    </Box>
  )
}

export default CenteredMessage
