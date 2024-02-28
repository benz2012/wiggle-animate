import { observer } from 'mobx-react-lite'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import ProjectSettingText from './ProjectSettingText'
import ExportStyleButton from './ExportStyleButton'
import EncodingSelector from './EncodingSelector'
import SettingSupportsAlpha from './SettingSupportsAlpha'

import { ENCODING_OPTIONS } from '../../../utility/encoding'

const ExportSettings = observer(({ store, exportStyle, setExportStyle }) => {
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

  return (
    <>
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
          <SettingSupportsAlpha value={store.output.encodingOption.supportsAlpha} />
        </>
      ) : (
        <Alert severity="error">
          <AlertTitle>Your web browser is not capable of exporting video.</AlertTitle>
          Try using one of the green Web Browser versions{' '}
          <a target="_blank" rel="noreferrer" href="https://caniuse.com/mdn-api_videoencoder">listed here</a>
          .
        </Alert>
      )}
    </>
  )
})

export default ExportSettings
