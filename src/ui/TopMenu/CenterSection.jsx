import { useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CheckIcon from '@mui/icons-material/Check'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import IconButton from '@mui/material/IconButton'

import theme from '../theme'
import usePrevious from '../hooks/usePrevious'
import GenericInputWithInternalValue from '../inputs/GenericInputWithInternalValue'

const CenterSection = observer(({ store }) => {
  const previousName = useRef(store.project.name)

  const [editName, setEditName] = useState(false)
  const prevEditName = usePrevious(editName)
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    if (prevEditName === false && editName === true) {
      previousName.current = store.project.name
      const editNameInputBox = document.getElementById('input-edit-project-name')
      if (editNameInputBox) { editNameInputBox.select() }
    }
  }, [editName, previousName])

  const [nameTextWidth, setNameTextWidth] = useState(0)

  const commitNewName = () => {
    const nameDidChange = previousName.current !== store.project.name
    if (nameDidChange) {
      store.actionStack.push({
        revert: ['project.setName', [previousName.current]],
        perform: ['project.setName', [store.project.name]],
      })
    }
    setEditName(false)
  }

  const { saveStatus } = store.project

  let color = 'success'
  if (saveStatus === 'saving') { color = 'info' }
  if (saveStatus === 'error saving') { color = 'error' }
  if (saveStatus === 'unsaved') { color = 'warning' }
  if (saveStatus === 'clean slate') { color = 'info' }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {editName ? (
        <IconButton size="small" sx={{ mr: 1 }} onClick={() => commitNewName()}>
          <CheckIcon color="success" sx={{ fontSize: '16px' }} />
        </IconButton>
      ) : (
        <IconButton
          size="small"
          sx={{ mr: 1 }}
          onClick={() => {
            const staticTextEl = document.getElementById('project-name-static-text')
            const staticTextBounds = staticTextEl.getBoundingClientRect()
            setNameTextWidth(staticTextBounds.width)
            setEditName(true)
          }}
        >
          <DriveFileRenameOutlineIcon sx={{ fontSize: '16px', color: `${theme.palette.action.half}` }} />
        </IconButton>
      )}

      {editName ? (
        <Box sx={{ mr: 2 }}>
          <GenericInputWithInternalValue
            availableWidth={nameTextWidth}
            label="edit-project-name"
            propertyValue={store.project.name}
            parseAndValidateNewValue={(newValue) => ({
              isValid: true,
              parsedValue: newValue,
            })}
            setPropertyValue={(newValue) => store.project.setName(newValue)}
            onBlur={() => commitNewName()}
            focusIdAfterCommitting="top-menu"
            noLabel
            autoFocus
            style={{ marginRight: '80px' }}
          />
        </Box>
      ) : (
        <Box id="project-name-static-text" sx={{ mr: 2 }}>
          {store.project.name || 'Untitled Project'}
        </Box>
      )}

      <Chip
        label={saveStatus}
        size="small"
        color={color}
        variant="outlined"
        sx={{
          fontFamily: 'monospace',
          fontSize: '12px',
          '& .MuiChip-label': {
            paddingLeft: saveStatus === 'saved' ? '11px' : '',
            paddingRight: saveStatus === 'saved' ? '11px' : '',
          },
        }}
      />
    </Box>
  )
})

export default CenterSection
