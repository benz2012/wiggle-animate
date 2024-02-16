import { useState } from 'react'
import { observer } from 'mobx-react-lite'

import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Paper from '@mui/material/Paper'

import TabListButton from '../settingsComponents/TabListButton'
import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'
import { parseAndValidateInteger } from '../inputs/util'
import { voidFunc } from '../../utility/object'

// animation length, FPS

// TODO [3]: Settings Ideas
//  - When selecting item on the stage, force open the containers in tree view, default: true

const SettingsDialog = observer(({ store, open, onClose }) => {
  const [tab, setTab] = useState('project')

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
            gap: 1,
          })}
        >
          <GenericInputWithInternalValue
            label="Canvas Size"
            availableWidth={200}
            propertyValue={store.rootContainer.canvasSize}
            subProperties={['width', 'height']}
            setPropertyValue={(newValue) => store.rootContainer.setCanvasSize(newValue)}
            parseAndValidateNewValue={(value) => {
              // Values below 10-pixel minimum will be marked invalid
              const parseOutput = parseAndValidateInteger(value)
              if (parseOutput.isValid && parseOutput.parsedValue !== Math.max(parseOutput.parsedValue, 10)) {
                parseOutput.isValid = false
              }
              return parseOutput
            }}
            addDragBox
          />
          <GenericInputWithInternalValue
            label="Canvas Fill"
            availableWidth={200}
            propertyValue={store.rootContainer.canvasFill}
            // We aren't allowing alpha editing at this time, but this is needed to prevent the
            // colorpicker component from entering an infinite render loop
            secondaryValue={100}
            subProperties={['red', 'green', 'blue']}
            setPropertyValue={(newValue) => store.rootContainer.setCanvasFill(newValue)}
            setSecondaryPropertyValue={voidFunc}
            parseAndValidateNewValue={parseAndValidateInteger}
            isColor
            addDragBox
          />
        </Paper>
      </Box>
    </Dialog>
  )
})

export default SettingsDialog
