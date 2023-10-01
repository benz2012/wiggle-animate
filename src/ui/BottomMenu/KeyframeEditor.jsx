import Box from '@mui/material/Box'

import CenteredMessage from './CenteredMessage'

const KeyframeEditor = ({ numSelected, selectedItem }) => {
  if (numSelected !== 1) {
    return <CenteredMessage numSelected={numSelected} />
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {selectedItem?.name}
    </Box>
  )
}

export default KeyframeEditor
