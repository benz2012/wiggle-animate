import Menu from '@mui/material/Menu'
import CropFreeIcon from '@mui/icons-material/CropFree'
import SquareIcon from '@mui/icons-material/Square'
import CircleIcon from '@mui/icons-material/Circle'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import PolylineIcon from '@mui/icons-material/Polyline'

import MenuListItem from './MenuListItem'
import theme from '../theme'

const size16 = { width: '16px', height: '16px' }

const InsertMenu = ({ anchorEl, open, handleClose, store }) => {
  const handleInsertActionWith = (func) => () => {
    func()
    handleClose()
    // Wait one tick since we conflict with MUI Javascript
    setTimeout(() => document.getElementById('stage').focus(), 0)
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      slotProps={{ paper: { sx: { width: 220 } } }}
      MenuListProps={{ dense: true }}
    >
      <MenuListItem
        hotkey="C"
        icon={<CropFreeIcon sx={{ color: 'rgb(200, 200, 200)', ...size16 }} />}
        onClick={handleInsertActionWith(() => store.stage.addContainer())}
      >
        Container
      </MenuListItem>
      <MenuListItem
        hotkey="R"
        icon={<SquareIcon sx={{ color: 'hsl(335, 70%, 70%)', ...size16 }} />}
        onClick={handleInsertActionWith(() => store.stage.addRectangle())}
      >
        Rectangle
      </MenuListItem>
      <MenuListItem
        hotkey="E"
        icon={<CircleIcon sx={{ color: 'hsl(182, 70%, 70%)', ...size16 }} />}
        onClick={handleInsertActionWith(() => store.stage.addEllipse())}
      >
        Ellipse
      </MenuListItem>
      <MenuListItem
        hotkey="Y"
        icon={<div className="list-item-icon-polygon" />}
        onClick={handleInsertActionWith(() => store.stage.addPolygon())}
      >
        Polygon
      </MenuListItem>
      <MenuListItem
        hotkey="L"
        icon={
          <HorizontalRuleIcon sx={{ color: 'rgb(97, 242, 165)', transform: 'rotate(45deg)', marginLeft: '-4px' }} />
        }
        onClick={handleInsertActionWith(() => store.stage.addLine())}
      >
        Line
      </MenuListItem>
      <MenuListItem
        hotkey="T"
        icon={<TextFieldsIcon sx={{ color: 'rgb(200, 200, 200)', ...size16 }} />}
        onClick={handleInsertActionWith(() => store.stage.addText())}
      >
        Text
      </MenuListItem>
      <MenuListItem
        hotkey="P"
        icon={<PolylineIcon sx={{ color: `${theme.palette.tertiary[100]}`, ...size16 }} />}
        onClick={handleInsertActionWith(() => store.build.setTool(store.tools.PATH))}
      >
        Path
      </MenuListItem>
    </Menu>
  )
}

export default InsertMenu
