import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

const HelpDialog = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Help & Guides</DialogTitle>
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

    <DialogContent
      sx={{
        maxHeight: '70vh',
        overflowY: 'scroll',
      }}
    >
      <Typography variant="h4">
        About this Tool
      </Typography>

      <DialogContentText>
        #### Have an Issue? Found a Bug? [Report it Here](github issues link)
      </DialogContentText>

      <DialogContentText>
        ## Basic Guides
      </DialogContentText>

      <Box>
        #### Move the Canvas
        <ul>
          <li>zooming</li>
          <li>moving</li>
          <li>reseting</li>
          <li>objects can go anywhere</li>
        </ul>
      </Box>

      <DialogContentText>
        #### Group objects Together
      </DialogContentText>

      <DialogContentText>
        #### Shape Drawing: Alignment vs. Origin
      </DialogContentText>

      <DialogContentText>
        #### Work with Bezier Paths
      </DialogContentText>

      <DialogContentText>
        #### Keyframe an Object
      </DialogContentText>

      <DialogContentText>
        #### Set a Work Region
      </DialogContentText>

      <DialogContentText>
        #### Adjust Project Settings
      </DialogContentText>

      <DialogContentText>
        #### Export my Project
      </DialogContentText>

      <DialogContentText>
        #### Use my Export in other Applications
      </DialogContentText>

      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>

      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>

      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>

      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>
      <Box>Filler Text</Box>

    </DialogContent>
  </Dialog>
)

export default HelpDialog
