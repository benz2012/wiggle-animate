import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

import theme from '../theme'
import { titleCase } from '../../utility/string'

const TabListButton = ({ name, tab, setTab }) => (
  <ListItemButton
    selected={tab === name}
    onClick={() => setTab(name)}
    sx={(muiTheme) => ({
      marginRight: 1,
      borderTopRightRadius: muiTheme.spacing(4),
      borderBottomRightRadius: muiTheme.spacing(4),
      '&.Mui-selected': {
        backgroundColor: `${theme.palette.primary[75]}`,
        '&:hover': { backgroundColor: `${theme.palette.primary[100]}` },
      },
    })}
  >
    <ListItemText>{titleCase(name)}</ListItemText>
  </ListItemButton>
)

export default TabListButton
