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
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { ENCODING_OPTIONS } from '../../utility/encoding'

// TODO [1]: enhance this visually and add note about browser, quality, and png or download would be best
// TODO [1]: add alpha setting to project settings
// TODO [1]: add alpha support via png sequence

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
      {/* TODO [2]: Add a link to download the Electron App and use a NodeJS exporter, once that exists */}
      {!store.output.browserHasVideoEncoder && (
        <Alert sx={{ mb: 2 }} severity="error">
          <AlertTitle>Your web browser is not capable of exporting video.</AlertTitle>
          Try using one of the green Web Browser versions{' '}
          <a target="_blank" rel="noreferrer" href="https://caniuse.com/mdn-api_videoencoder">listed here</a>
          .
        </Alert>
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

      <Select
        value={`${store.output.encodingOption.container}-${store.output.encodingOption.codec}`}
        onChange={(event) => {
          const { value: newValue } = event.target
          const newEncodingOption = ENCODING_OPTIONS.find((option) => (
            `${option.container}-${option.codec}` === newValue
          ))
          store.output.setEncodingOption(newEncodingOption)
          store.output.setExportProgress(null)
        }}
      >
        {
          ENCODING_OPTIONS
            .filter((option) => {
              if (store.output.browserHasVideoEncoder === false) {
                return !option.requiresVideoEncoder
              }
              return true
            })
            .map((option) => {
              const optionKey = `${option.container}-${option.codec}`
              return (
                <MenuItem key={optionKey} value={optionKey}>
                  {option.containerName} {option.codecName ? `with ${option.codecName}` : ''}
                </MenuItem>
              )
            })
        }
      </Select>

      <Divider />
      <Box sx={{ mb: 1 }} />

      <DialogContentText>
        Output status
      </DialogContentText>
      <Box sx={{ mb: 1 }} />

      Progress: {store.output.exportProgress != null && (
        <LinearProgress variant="determinate" color="secondary" value={store.output.exportProgress} />
      )}

      {!!store.output.errorMessage && <Alert severity="error">{store.output.errorMessage}</Alert>}
    </DialogContent>

    <DialogActions>
      <Button
        sx={{ paddingLeft: 2, paddingRight: 2 }}
        onClick={store.output.export}
        disabled={!!store.output.errorMessage || store.output.isExporting}
      >
        Export
      </Button>
    </DialogActions>
  </Dialog>
))

export default ExportDialog
