import { forwardRef } from 'react'
import Button from '@mui/material/Button'

const MenuButton = forwardRef(({ onClick, icon, children, nudge = -2, noText = false }, ref) => (
  <Button
    ref={ref}
    onClick={onClick}
    startIcon={icon}
    sx={{
      fontWeight: 700,
      paddingLeft: noText ? 1 : 2,
      paddingRight: noText ? 1 : 2,
      '& .MuiButton-startIcon': {
        marginLeft: `${nudge}px`,
        marginRight: `${10 + nudge}px`,
        ...(noText ? { margin: 0 } : {}),
      },
      ...(noText ? { minWidth: 0 } : {}),
    }}
  >
    {children}
  </Button>
))

export default MenuButton
