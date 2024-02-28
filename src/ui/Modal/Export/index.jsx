import { useState } from 'react'
import { observer } from 'mobx-react-lite'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LaunchIcon from '@mui/icons-material/Launch'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

import ProjectSettingText from './ProjectSettingText'
import DownloadAlert from './DownloadAlert'
import ProjectReview from './ProjectReview'

import Storage from '../../../store/Storage'
import { storageGet, storageSet } from '../../../utility/storage'
import ExportSettings from './ExportSettings'

const ExportDialog = observer(({ store, open, onClose }) => {
  const [downloadAlertClosed, setDownloadAlertClosed] = useState(
    storageGet(Storage.KEYS.DOWNLOAD_ALERT_CLOSED) === 'true'
  )

  const [exportStyle, setExportStyle] = useState('Image Sequence')

  let expectedOutputFilename = `${store.output.fileName}.${store.output.encodingOption.container}`
  if (store.output.encodingOption.imageSequence) {
    expectedOutputFilename = `${store.output.fileName}.#####.${store.output.encodingOption.container} (as a ZIP file)`
  }

  let progressComponent = null
  if (store.output.exportProgress != null) {
    progressComponent = (
      <LinearProgress
        sx={{ flexGrow: 1 }}
        variant="determinate"
        color="secondary"
        value={store.output.exportProgress}
      />
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      sx={{ '& .MuiDialog-paper': { maxWidth: '700px' } }}
      fullWidth
    >
      <DialogTitle sx={(theme) => ({ borderBottom: `1px solid ${theme.palette.divider}` })}>
        Export Your Animation
      </DialogTitle>
      {downloadAlertClosed && (
        <Button
          href="https://wiggle.tools/#downloads"
          target="_blank"
          rel="noopener"
          variant="outlined"
          endIcon={<LaunchIcon />}
          sx={{
            position: 'absolute',
            right: 64,
            top: 14,
          }}
        >
          Use Desktop App
        </Button>
      )}
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
        {!downloadAlertClosed && (
          <DownloadAlert
            handleClose={() => {
              setDownloadAlertClosed(true)
              storageSet(Storage.KEYS.DOWNLOAD_ALERT_CLOSED, 'true')
            }}
          />
        )}

        {/* Top: Review Settings */}
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ paddingRight: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <ProjectReview store={store} />
          </Box>

          <Box
            sx={(theme) => ({
              width: '57%',
              paddingLeft: 2,
              borderLeft: `1px solid ${theme.palette.divider}`,
              minHeight: '196px',
            })}
          >
            <ExportSettings store={store} exportStyle={exportStyle} setExportStyle={setExportStyle} />
          </Box>
        </Box>

        <Divider sx={{ marginTop: 2, marginBottom: 1 }} />

        {/* Bottom: Output Section */}
        <Typography variant="h6">Output</Typography>
        <ProjectSettingText
          label="File Name:"
          sx={{ marginTop: 1, justifyContent: 'flex-start', gap: 1 }}
          value={expectedOutputFilename}
        />
        <ProjectSettingText
          label="Progress:"
          sx={{ marginTop: 1, justifyContent: 'none', gap: 1 }}
          valueNotTypography
          value={progressComponent}
        />

        {!!store.output.errorMessage && (
          <Alert severity="error" sx={{ marginTop: 2 }}>{store.output.errorMessage}</Alert>
        )}
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
  )
})

export default ExportDialog
