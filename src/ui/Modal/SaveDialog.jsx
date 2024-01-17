import { useState, useEffect, useRef } from 'react'

import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import DownloadIcon from '@mui/icons-material/Download'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

const SaveDialog = ({ store, open, onClose }) => {
  const [fileName, setFileName] = useState('')
  const [clickedSave, setClickedSave] = useState(false)

  const prevOpen = useRef(open)
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      setClickedSave(false)
    }
    prevOpen.current = open
  }, [open])

  useEffect(() => {
    setFileName(store.project.name || 'Untitled Animation Project')
  }, [
    store.project.name,
  ])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Download Your Project File</DialogTitle>
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

      <DialogContent>
        <DialogContentText sx={{ fontSize: '14px', mb: 2 }}>
          Download the current animation project as a JSON file.<br />
          It&apos;s small and portable, and you can even edit the JSON by-hand if you&apos;d like.
        </DialogContentText>
        <TextField
          label="File Name"
          fullWidth
          InputProps={{ endAdornment: <InputAdornment position="end">.json</InputAdornment> }}
          value={fileName}
          onChange={(event) => {
            setFileName(event.target.value)
            setClickedSave(false)
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ paddingLeft: 2, paddingRight: 2 }}
          startIcon={<DownloadIcon />}
          onClick={() => {
            setClickedSave(true)
            store.project.save(fileName)
          }}
          disabled={clickedSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SaveDialog
