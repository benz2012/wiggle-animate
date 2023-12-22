import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

const ExportDialog = ({ store, open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Export Animation</DialogTitle>
    <IconButton
      aria-label="close"
      onClick={onClose}
      disabled={store.project.isExporting}
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
      <DialogContentText>Customization: coming in a future update</DialogContentText>
      <Box sx={{ mb: 1 }} />
      <DialogContentText>
        {store.animation.frames} frames
      </DialogContentText>
      <DialogContentText>
        {store.animation.fps} FPS
      </DialogContentText>
      <DialogContentText>
        {store.rootContainer.canvasSize.width}x{store.rootContainer.canvasSize.height}
      </DialogContentText>
      <DialogContentText>
        black background
      </DialogContentText>
      <Box sx={{ mb: 1 }} />
      <DialogContentText>
        Output file: {store.project.exportFileName}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button sx={{ paddingLeft: 2, paddingRight: 2 }} onClick={store.export}>Export</Button>
    </DialogActions>
  </Dialog>
)

export default ExportDialog
