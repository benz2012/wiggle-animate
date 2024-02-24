import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'

import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Paper from '@mui/material/Paper'

import TabListButton from './TabListButton'
import AnimationLengthInput from './AnimationLengthInput'
import AnimationRateInput from './AnimationRateInput'
import CanvasSizeInput from './CanvasSizeInput'
import CanvasFillInput from './CanvasFillInput'
import TransparencyInput from './TransparencyInput'
import TransparencyIndicatorInput from './TransparencyIndicatorInput'

// TODO [3]: Settings Ideas
//  - When selecting item on the stage, force open the containers in tree view, default: true

const WIDTH_OF_SETTINGS = 200

const SettingsDialog = observer(({ store, open, onClose }) => {
  const [tab, setTab] = useState('project')

  const settingsForTab = useMemo(() => {
    if (tab === 'project') {
      return (
        <>
          <Box mb={1}>Animation</Box>
          <AnimationLengthInput store={store} availableWidth={WIDTH_OF_SETTINGS} />
          <AnimationRateInput store={store} availableWidth={WIDTH_OF_SETTINGS} />
          <Box mt={1} mb={1}>Canvas</Box>
          <CanvasSizeInput store={store} availableWidth={WIDTH_OF_SETTINGS} />
          <CanvasFillInput store={store} availableWidth={WIDTH_OF_SETTINGS} />
          <TransparencyInput store={store} availableWidth={WIDTH_OF_SETTINGS} />
          <TransparencyIndicatorInput store={store} availableWidth={WIDTH_OF_SETTINGS} />
        </>
      )
    }
    if (tab === 'interactions') {
      return <Box>Coming Soon</Box>
    }
    if (tab === 'hotkeys') {
      return <Box>Coming Soon</Box>
    }
    return null
  }, [tab, store])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 12,
          top: 12,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flexGrow: 1 }}>
          <List dense sx={{ paddingTop: 0 }}>
            <TabListButton name="project" tab={tab} setTab={setTab} />
            <TabListButton name="interactions" tab={tab} setTab={setTab} />
            <TabListButton name="hotkeys" tab={tab} setTab={setTab} />
          </List>
        </Box>
        <Paper
          elevation={0}
          sx={(theme) => ({
            width: `calc(70% - ${theme.spacing(2)})`,
            minHeight: `calc(300px - ${theme.spacing(2)})`,
            padding: 2,
            borderRadius: 0,
            borderTopLeftRadius: theme.spacing(1),
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          })}
        >
          {settingsForTab}
        </Paper>
      </Box>
    </Dialog>
  )
})

export default SettingsDialog
