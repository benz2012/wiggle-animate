import Box from '@mui/material/Box'

import LeftRightText from '../LeftRightText'
import { getBrowserModifierKey } from '../../../utility/string'

const BMK = getBrowserModifierKey()

const Font16 = ({ children }) => (
  <span style={{ fontSize: '16px', lineHeight: '12px' }}>{children}</span>
)
const Font16Then12 = ({ left, right }) => (
  <span style={{ lineHeight: '12px', display: 'inline-flex', alignItems: 'center' }}>
    <Font16>{left}</Font16>&nbsp;{right}
  </span>
)
const Font12Then16 = ({ left, right }) => (
  <span style={{ lineHeight: '12px', display: 'inline-flex', alignItems: 'center' }}>
    {left}&nbsp;<Font16>{right}</Font16>
  </span>
)

const HotkeyList = () => (
  <>
    <Box mb={1}>General Shortcuts</Box>
    <LeftRightText label="Undo" value={<Font16Then12 left={BMK} right="Z" />} />
    <LeftRightText label="Redo" value={<Font16Then12 left={BMK} right="Y" />} />
    <LeftRightText label="Open Settings Window" value={<Font16Then12 left={BMK} right="," />} />
    <LeftRightText label="Open Export Window" value={<Font16Then12 left={BMK} right="E" />} />
    <LeftRightText label="Open Project File" value={<Font16Then12 left={BMK} right="O" />} />
    <LeftRightText label="Save Project File" value={<Font16Then12 left={BMK} right="S" />} />
    <LeftRightText label="Close Modal Window" value="ESCAPE" />

    <Box mt={2} mb={1}>Stage Shortcuts</Box>
    <LeftRightText label="Move the Canvas" value="HOLD SPACE or MIDDLE MOUSE" />
    <LeftRightText label="Zoom In" value={<Font16Then12 left={BMK} right="=" />} />
    <LeftRightText label="Zoom Out" value={<Font16Then12 left={BMK} right="-" />} />
    <LeftRightText label="Reset Zoom / Center the Canvas" value="F" />
    <LeftRightText label="Select all Items" value={<Font16Then12 left={BMK} right="A" />} />
    <LeftRightText label="De-select all Items" value={<Font16Then12 left={BMK} right="D" />} />
    <LeftRightText
      label="Add / Remove Item from Selection"
      value={<Font12Then16 left="HOLD SHIFT or" right={BMK} />}
    />
    <LeftRightText label="Delete Selected Items" value="BACKSPACE or DELETE" />
    <LeftRightText label="Copy Selection" value={<Font16Then12 left={BMK} right="C" />} />
    <LeftRightText label="Cut Selection" value={<Font16Then12 left={BMK} right="X" />} />
    <LeftRightText label="Paste Selection" value={<Font16Then12 left={BMK} right="V" />} />

    <Box mt={2} mb={1}>Insert Shortcuts</Box>
    <LeftRightText label="Insert Container" value="C" />
    <LeftRightText label="Insert Rectangle" value="R" />
    <LeftRightText label="Insert Ellipse" value="E" />
    <LeftRightText label="Insert Polygon" value="Y" />
    <LeftRightText label="Insert Line" value="L" />
    <LeftRightText label="Insert Text" value="T" />
    <LeftRightText label="Path Drawing Tool" value="P" />
    <LeftRightText sx={{ marginLeft: 2 }} label="Commit the Path but don't close it" value="ESCAPE" />
    <LeftRightText
      sx={{ marginLeft: 2 }}
      label="Explode / Collapse Bezier Handles"
      value={<Font16Then12 left="&#8997;" right="CLICK" />}
    />
    <LeftRightText
      sx={{ marginLeft: 2 }}
      label="Free-Drag One Bezier Handle"
      value={<Font16Then12 left="&#8997;" right="DRAG" />}
    />

    <Box mt={2} mb={1}>With Item(s) Selected</Box>
    <LeftRightText label="Move Up" value={<Font16>&#8593;</Font16>} />
    <LeftRightText label="Move Down" value={<Font16>&#8595;</Font16>} />
    <LeftRightText label="Move Left" value={<Font16>&#8592;</Font16>} />
    <LeftRightText label="Move Right" value={<Font16>&#8594;</Font16>} />
    <LeftRightText label="Move Up x10" value={<>SHIFT <Font16>&#8593;</Font16></>} />
    <LeftRightText label="Move Down x10" value={<>SHIFT <Font16>&#8595;</Font16></>} />
    <LeftRightText label="Move Left x10" value={<>SHIFT <Font16>&#8592;</Font16></>} />
    <LeftRightText label="Move Right x10" value={<>SHIFT <Font16>&#8594;</Font16></>} />

    <Box mt={2} mb={1}>Property Editor Shortcuts</Box>
    <LeftRightText label="Increase Value" value={<Font16>&#8593;</Font16>} />
    <LeftRightText label="Decrease Value" value={<Font16>&#8595;</Font16>} />
    <LeftRightText label="Increase Value x10" value={<>SHIFT <Font16>&#8593;</Font16></>} />
    <LeftRightText label="Decrease Value x10" value={<>SHIFT <Font16>&#8595;</Font16></>} />
    <LeftRightText label="Commit Value" value="ENTER" />

    <Box mt={2} mb={1}>Bottom Bar Shortcuts</Box>
    <LeftRightText label="Play / Pause" value="SPACE" />
    <LeftRightText label="Previous Frame" value={<Font16>&#8592;</Font16>} />
    <LeftRightText label="Next Frame" value={<Font16>&#8594;</Font16>} />
    <LeftRightText label="Jump to First Frame" value={<>SHIFT <Font16>&#8592;</Font16></>} />
    <LeftRightText label="Jump to Last Frame" value={<>SHIFT <Font16>&#8594;</Font16></>} />
    <LeftRightText label="Set Work Region In" value="I" />
    <LeftRightText label="Set Work Region Out" value="O" />
    <LeftRightText label="Clear Work Region" value="C" />

    <Box mt={2} mb={1}>Keyframe Shortcuts</Box>
    <LeftRightText label="Select all Keyframes" value={<Font16Then12 left={BMK} right="A" />} />
    <LeftRightText label="De-select all Keyframes" value={<Font16Then12 left={BMK} right="D" />} />
    <LeftRightText label="Delete Selected Keyframes" value="BACKSPACE or DELETE" />
    <LeftRightText label="Curve Editor Snap-to-Grid" value="HOLD SHIFT" />
    {/* <LeftRightText label="Copy Keyframes" value={<Font16Then12 left={BMK} right="C" />} /> */}
    {/* <LeftRightText label="Cut Keyframes" value={<Font16Then12 left={BMK} right="X" />} /> */}
    {/* <LeftRightText label="Paste Keyframes" value={<Font16Then12 left={BMK} right="V" />} /> */}

    <Box mb={2} />
  </>
)

export default HotkeyList
