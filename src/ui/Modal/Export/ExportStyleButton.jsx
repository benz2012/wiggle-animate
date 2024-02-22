import Button from '@mui/material/Button'

import theme from '../../theme'

const ExportStyleButton = ({ name, rightSide = false, exportStyle, setExportStyle }) => (
  <Button
    variant="outlined"
    disableElevation
    sx={{
      padding: 0.5,
      borderRadius: 0,
      textTransform: 'none',
      color: exportStyle === name ? `${theme.palette.text.main}` : undefined,
      backgroundColor: exportStyle === name ? `${theme.palette.primary[100]}` : undefined,

      '&:hover': {
        backgroundColor: exportStyle === name ? `${theme.palette.primary[75]}` : undefined,
        borderColor: exportStyle === name ? `${theme.palette.primary[75]}` : undefined,
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

export default ExportStyleButton
