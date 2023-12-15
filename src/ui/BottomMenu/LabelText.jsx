import Typography from '@mui/material/Typography'

const LabelText = ({ children, sx, ...rest }) => (
  <Typography
    className="noselect"
    sx={{
      fontFamily: 'monospace',
      fontSize: 12,
      color: 'text.disabled',
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Typography>
)

export default LabelText
