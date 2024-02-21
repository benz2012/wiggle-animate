import { useState } from 'react'
import { observer } from 'mobx-react-lite'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import IconButton from '@mui/material/IconButton'
import LaunchIcon from '@mui/icons-material/Launch'
import Link from '@mui/material/Link'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

import myTheme from '../theme'
import Storage from '../../store/Storage'
import { storageGet, storageSet } from '../../utility/storage'
import { ENCODING_OPTIONS } from '../../utility/encoding'

// TODO [1]: add alpha setting to project settings

const ProjectSettingText = ({ label, value, sx, valueNotTypography = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...sx }}>
    <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{label}</Typography>
    {valueNotTypography ? value : (
      <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{value}</Typography>
    )}
  </Box>
)

const EncodingSelector = ({ options, keys, value, handleChange }) => (
  <Select
    value={value}
    onChange={handleChange}
    sx={(theme) => ({
      width: '200px',
      '& .MuiInputBase-input': {
        margin: '0px',
        padding: theme.spacing(0.25),
        paddingLeft: theme.spacing(1),
        fontSize: 12,
        fontFamily: 'monospace',
      },
    })}
  >
    {options.map((option, index) => (
      <MenuItem
        key={keys[index]}
        value={keys[index]}
        sx={(theme) => ({
          fontSize: 12,
          fontFamily: 'monospace',
          padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
        })}
      >
        {option}
      </MenuItem>
    ))}
  </Select>
)

const ExportStyleButton = ({ name, rightSide = false, exportStyle, setExportStyle }) => (
  <Button
    variant="outlined"
    disableElevation
    sx={{
      padding: 0.5,
      borderRadius: 0,
      textTransform: 'none',
      color: exportStyle === name ? `${myTheme.palette.text.main}` : undefined,
      backgroundColor: exportStyle === name ? `${myTheme.palette.primary[100]}` : undefined,

      '&:hover': {
        backgroundColor: exportStyle === name ? `${myTheme.palette.primary[75]}` : undefined,
        borderColor: exportStyle === name ? `${myTheme.palette.primary[75]}` : undefined,
        ...(rightSide ? { borderLeft: 'none' } : {}),
      },

      ...(rightSide ? ({
        flexGrow: 1,
        borderTopRightRadius: '100px',
        borderBottomRightRadius: '100px',
        borderLeft: 'none',
      }) : ({
        width: '50%',
        borderTopLeftRadius: '100px',
        borderBottomLeftRadius: '100px',
      })),
    }}
    onClick={() => setExportStyle(name)}
  >
    {name}
  </Button>
)

const ExportDialog = observer(({ store, open, onClose }) => {
  const [downloadAlertClosed, setDownloadAlertClosed] = useState(
    storageGet(Storage.KEYS.DOWNLOAD_ALERT_CLOSED) === 'true'
  )

  const [exportStyle, setExportStyle] = useState('Image Sequence')

  const encodingOptionsForThisBrowser = ENCODING_OPTIONS.filter((option) => {
    if (store.output.browserHasVideoEncoder === false) {
      return !option.requiresVideoEncoder
    }
    return true
  })
  const encodingOptionsForSequences = encodingOptionsForThisBrowser.filter((option) => !!option.imageSequence)
  const encodingOptionsForVideos = encodingOptionsForThisBrowser.filter((option) => !option.imageSequence)

  const encodingOptions = exportStyle === 'Image Sequence' ? encodingOptionsForSequences : encodingOptionsForVideos
  const encodingOptionNames = encodingOptions.map((option) => (
    `${option.containerName}${option.codecName ? ` with ${option.codecName}` : ''}`
  ))
  const encodingOptionKeys = encodingOptions.map((option) => (
    `${option.container}-${option.codec}`
  ))
  const selectedEncodingOptionKey = `${store.output.encodingOption.container}-${store.output.encodingOption.codec}`

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
          <Alert
            sx={{ marginTop: -1, marginBottom: 1 }}
            severity="info"
            onClose={() => {
              setDownloadAlertClosed(true)
              storageSet(Storage.KEYS.DOWNLOAD_ALERT_CLOSED, 'true')
            }}
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
        )}

        <Box sx={{ display: 'flex' }}>

          {/* Left Side: Your Animation */}
          <Box sx={{ paddingRight: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6">Your Animation</Typography>

            <ProjectSettingText label="Frame Length" value={`${store.animation.frames} frames`} />
            <ProjectSettingText label="Frame Rate" value={`${store.animation.fps.toFixed(2)} FPS`} />
            <ProjectSettingText
              label="Resolution"
              value={`${store.rootContainer.canvasSize.width} x ${store.rootContainer.canvasSize.height}`}
            />
            <ProjectSettingText
              label="Background Color"
              value={(
                <Box component="span" sx={{ display: 'inline-flex', height: '100%', alignItems: 'center' }}>
                  {store.rootContainer.canvasFill.toShortString()}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      backgroundColor: `${store.rootContainer.canvasFill}`,
                      width: '14px',
                      height: '14px',
                      marginLeft: 1,
                      borderRadius: 1,
                    }}
                  />
                </Box>
              )}
            />
          </Box>

          {/* Right Side: Export Settings */}
          <Box
            sx={(theme) => ({
              width: '57%',
              paddingLeft: 2,
              borderLeft: `1px solid ${theme.palette.divider}`,
              minHeight: '196px',
            })}
          >
            <Typography variant="h6">Export Settings</Typography>

            <Box sx={{ width: '100%', display: 'flex', marginBottom: 1 }}>
              <ExportStyleButton
                name="Image Sequence"
                exportStyle={exportStyle}
                setExportStyle={(value) => {
                  store.output.setExportProgress(null)
                  setExportStyle(value)
                  if (encodingOptionsForSequences.length === 0) return
                  store.output.setEncodingOption(encodingOptionsForSequences[0])
                }}
              />
              <ExportStyleButton
                name="Video"
                exportStyle={exportStyle}
                setExportStyle={(value) => {
                  store.output.setExportProgress(null)
                  setExportStyle(value)
                  if (encodingOptionsForVideos.length === 0) return
                  store.output.setEncodingOption(encodingOptionsForVideos[0])
                }}
                rightSide
              />
            </Box>

            {encodingOptionKeys.length > 0 ? (
              <>
                {exportStyle === 'Image Sequence' ? (
                  <Alert severity="info" color="primary" variant="outlined" icon={false} sx={{ marginBottom: 1 }}>
                    Image Sequence export will give you the highest quality output.
                  </Alert>
                ) : (
                  <Alert severity="warning" variant="outlined" icon={false} sx={{ marginBottom: 1 }}>
                    <strong>Video export from web browsers is experimental.</strong><br />
                    Use Google Chrome if possible.
                  </Alert>
                )}
                <ProjectSettingText
                  sx={{ marginTop: 2, marginBottom: 0 }}
                  label="Encoding"
                  valueNotTypography
                  value={(
                    <EncodingSelector
                      options={encodingOptionNames}
                      keys={encodingOptionKeys}
                      value={selectedEncodingOptionKey}
                      handleChange={(event) => {
                        const { value: newValue } = event.target
                        const newEncodingOption = ENCODING_OPTIONS.find((option) => (
                          `${option.container}-${option.codec}` === newValue
                        ))
                        store.output.setEncodingOption(newEncodingOption)
                        store.output.setExportProgress(null)
                      }}
                    />
                  )}
                />
                <ProjectSettingText
                  label="Supports Alpha"
                  valueNotTypography
                  value={(
                    <Box sx={{ marginTop: 1, display: 'flex', height: '100%', alignItems: 'center' }}>
                      {store.output.encodingOption.supportsAlpha ? (
                        <>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            Yes
                          </Typography>
                          <CheckCircleOutlineIcon sx={{ marginLeft: 1, fontSize: 16 }} />
                        </>
                      ) : (
                        <>
                          <Typography sx={{ color: 'error.main', fontFamily: 'monospace', fontSize: 12 }}>
                            No
                          </Typography>
                          <HighlightOffIcon sx={{ color: 'error.main', marginLeft: 1, fontSize: 16 }} />
                        </>
                      )}
                    </Box>
                  )}
                />
              </>
            ) : (
              <Alert severity="error">
                <AlertTitle>Your web browser is not capable of exporting video.</AlertTitle>
                Try using one of the green Web Browser versions{' '}
                <a target="_blank" rel="noreferrer" href="https://caniuse.com/mdn-api_videoencoder">listed here</a>
                .
              </Alert>
            )}
          </Box>

          {/* Closes top section */}
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
