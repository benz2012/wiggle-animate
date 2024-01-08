import { forwardRef } from 'react'
import Button from '@mui/material/Button'

const MenuButton = forwardRef(({ onClick, icon, children }, ref) => (
  <Button
    ref={ref}
    onClick={onClick}
    startIcon={icon}
    sx={{
      fontWeight: 700,
      paddingLeft: 2,
      paddingRight: 2,
      '& .MuiButton-startIcon': { marginLeft: '-2px' },
    }}
  >
    {children}
  </Button>
))

export default MenuButton
