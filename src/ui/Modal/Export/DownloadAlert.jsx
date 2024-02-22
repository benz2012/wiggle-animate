import Alert from '@mui/material/Alert'
import LaunchIcon from '@mui/icons-material/Launch'
import Link from '@mui/material/Link'

const DownloadAlert = ({ handleClose }) => (
  <Alert
    sx={{ marginTop: -1, marginBottom: 1 }}
    severity="info"
    onClose={handleClose}
  >
    For the best export options, download the&nbsp;
    <Link
      href="https://wiggle.tools/#downloads"
      target="_blank"
      rel="noopener"
      underline="always"
      sx={{ display: 'inline-flex', alignItems: 'center' }}
    >
      Wiggle Animate Desktop App&nbsp;<LaunchIcon sx={{ fontSize: '14px' }} />
    </Link>
    .
  </Alert>
)

export default DownloadAlert
