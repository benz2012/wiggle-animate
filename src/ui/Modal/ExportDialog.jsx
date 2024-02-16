import { observer } from 'mobx-react-lite'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'

const ExportDialog = observer(({ store, open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Export Your Animation</DialogTitle>
    <IconButton
      aria-label="close"
      onClick={onClose}
      disabled={store.output.isExporting}
      sx={{
        position: 'absolute',
        right: 12,
        top: 12,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
    <DialogContent>
      {/* TODO [4]: Add a link to download the Electron App and use a NodeJS exporter, once that exists */}
      {!store.output.browserCanExport ? (
        <Alert sx={{ mb: 2 }} severity="error">
          <AlertTitle>Your web browser is not capable of exporting video.</AlertTitle>
          Try using one of the green Web Browser versions{' '}
          <a target="_blank" rel="noreferrer" href="https://caniuse.com/mdn-api_videoencoder">listed here</a>
          .
        </Alert>
      ) : (
        <Alert sx={{ mb: 2 }} severity="info">You can customize these settings in: Project &gt; Settings</Alert>
      )}

      <DialogContentText>
        Frame Length: {store.animation.frames} frames
      </DialogContentText>
      <DialogContentText>
        Frame Rate: {store.animation.fps} FPS
      </DialogContentText>
      <DialogContentText>
        Resolution: {store.rootContainer.canvasSize.width}x{store.rootContainer.canvasSize.height}
      </DialogContentText>
      <DialogContentText
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        Background Color: {store.rootContainer.canvasFill.toShortString()}
        <Box
          component="span"
          sx={{
            backgroundColor: `${store.rootContainer.canvasFill}`,
            width: '16px',
            height: '16px',
            marginLeft: 1,
            borderRadius: 1,
          }}
        />
      </DialogContentText>
      <Box sx={{ mb: 1 }} />
      <DialogContentText>
        Output file: {store.output.fileName}
      </DialogContentText>
      <Box sx={{ mb: 1 }} />
    </DialogContent>
    <DialogActions>
      <Button
        sx={{ paddingLeft: 2, paddingRight: 2 }}
        onClick={store.output.export}
        disabled={!store.output.browserCanExport}
      >
        Export
      </Button>
    </DialogActions>
  </Dialog>
))

export default ExportDialog
