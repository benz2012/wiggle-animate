import { forwardRef } from 'react'
import Button from '@mui/material/Button'

import theme from '../theme'

const MenuButton = forwardRef(({ onClick, icon, children, menuOpen, nudge = -2, noText = false }, ref) => (
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

      backgroundColor: menuOpen ? `${theme.palette.primary[10]}` : undefined,
    }}
  >
    {children}
  </Button>
))

export default MenuButton
