import Box from '@mui/material/Box'

const Tick = ({ sx }) => (
  <Box
    sx={(theme) => ({
      width: '0px',
      height: '8px',
      borderRight: `1px solid ${theme.palette.primary.main}`,
      ...sx,
    })}
  />
)

const Arrow = ({ direction }) => (
  <Box
    sx={{
      width: '0px',
      height: '8px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={(theme) => ({
        width: '5px',
        height: '5px',
        borderTop: `1px solid ${theme.palette.primary.main}`,
        borderLeft: `1px solid ${theme.palette.primary.main}`,
        ...(direction === 'left' ? {
          transform: 'rotate(-45deg)',
          marginRight: '-6px',
        } : {
          transform: 'rotate(135deg)',
          marginLeft: '-6px',
        }),
      })}
    />
  </Box>
)

const Dash = () => (
  <Box
    sx={(theme) => ({
      flexGrow: 1,
      height: '0px',
      borderBottom: `1px solid ${theme.palette.primary.main}`,
    })}
  />
)

export {
  Tick,
  Arrow,
  Dash,
}
