import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

const ButtonAction = observer(({
  children,
  onClick,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <span />

    <Box sx={{ flexGrow: 1 }} />

    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        fontSize: 12,
        lineHeight: 0,
        fontFamily: 'monospace',
        height: '26px',
        width: '150px',
        paddingTop: '1px',
        paddingBottom: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Button>
  </Box>
))

export default ButtonAction
