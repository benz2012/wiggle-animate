import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'

import addingKeyframesGIF from '../../assets/adding-keyframes.gif'
import bezierPathsGIF from '../../assets/bezier-paths.gif'
import buildingShapesGIF from '../../assets/building-shapes.gif'
import usingCanvasGIF from '../../assets/using-canvas.gif'

import KeyCallout from './KeyCallout'

const PrimaryExternalLink = ({ href, children }) => (
  <Link
    color="primary"
    underline="always"
    target="_blank"
    rel="noopener"
    href={href}
  >
    {children}
  </Link>
)

const HelpDialog = ({ store, open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Help & Guides</DialogTitle>
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize: 12,
        color: 'text.disabled',
        position: 'absolute',
        right: 64,
        top: 24,
      }}
    >
      App Version v{process.env.REACT_APP_VERSION}
    </Typography>
    <IconButton
      aria-label="close"
      onClick={onClose}
      sx={{
        position: 'absolute',
        right: 12,
        top: 12,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>

    <Divider />

    <DialogContent
      sx={{
        maxHeight: '70vh',
        overflowY: 'scroll',
        paddingBottom: '48px',
      }}
    >
      <Typography variant="h5">
        About
      </Typography>
      <DialogContentText>
        Wiggle Animate is part of a larger body of work that is branded as a suite of purpose-built tools
        that are simple in their feature-set but powerful in what they create. These are called the Wiggle Tools.
        <br />
        To learn more visit&nbsp;
        <PrimaryExternalLink href="https://wiggle.tools/">https://wiggle.tools/</PrimaryExternalLink>
      </DialogContentText>

      <Typography variant="h5" mt={2}>
        Have an Issue? Found a Bug?
      </Typography>
      <DialogContentText>
        Discuss issues with the developers and community members&nbsp;
        <PrimaryExternalLink href="https://www.reddit.com/r/wiggletools/">on our Reddit page</PrimaryExternalLink>
        .
        Alternatively, submit bug tickets directly via&nbsp;
        <PrimaryExternalLink href="https://github.com/benz2012/wiggle-animate/issues">
          GitHub Issues
        </PrimaryExternalLink>
        .
      </DialogContentText>

      <Typography variant="h5" mt={2}>
        Keyboard Shortcuts
      </Typography>
      <DialogContentText sx={{ display: 'flex' }}>
        View all of the Keyboard Shortcuts within&nbsp;
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link
          component="button"
          onClick={() => {
            store.view.closeDialog('help')
            // Giving it a tick creates a smoother visual transition
            setTimeout(() => {
              store.view.setSettingsTab('hotkeys')
              store.view.openDialog('settings')
            }, 1)
          }}
        >
          Project &gt; Settings &gt; Hotkeys &#8594;
        </Link>
      </DialogContentText>

      <Typography variant="h5" mt={2}>
        Using the Canvas View
      </Typography>
      <DialogContentText>
        Move the Canvas around by holding <KeyCallout>Space</KeyCallout> and dragging your Mouse.
        <br />
        Zoom in and out using the buttons at the bottom the layer menu, or the hotkeys&nbsp;
        <KeyCallout>CMD/CTRL +</KeyCallout> and <KeyCallout>CMD/CTRL -</KeyCallout>. Reset the view at any
        time with the reset button in the layer menu, or select the Canvas and press <KeyCallout>F</KeyCallout>.
        <br />

        <img
          loading="lazy"
          style={{ width: '100%', marginTop: '8px' }}
          src={usingCanvasGIF}
          alt="how to use the canvas"
        />
      </DialogContentText>

      <Typography variant="h5" mt={2}>
        Building Shapes and Graphics
      </Typography>
      <DialogContentText>
        Add shapes, lines, text, and curves from the Insert menu, where you&apos;ll also find their hotkeys.
        New objects are added to the center of the Canvas with a random pastel fill color and a random Human layer name.
        <br /><Box component="span" sx={{ display: 'inline-block', height: '34px' }} />
        Objects can be placed anywhere on the Stage, but only those within the Canvas will be exported.
        Shapes can be anchored/aligned to one of their edges or corners, and you can also move an object&apos;s
        origin to affect its scale and rotation point.
        <br /><Box component="span" sx={{ display: 'inline-block', height: '34px' }} />
        Objects can be grouped into Containers, which can be thought of as a Folder, but also as a Parent.
        These containers have their own transform properties which can be used to affect a group of objects
        during your build process, or over time with their own keyframes.

        <img
          loading="lazy"
          style={{ width: '100%', marginTop: '8px' }}
          src={buildingShapesGIF}
          alt="how to build shapes and graphics"
        />
      </DialogContentText>

      <Typography variant="h5" mt={2}>
        Bezier Paths
      </Typography>
      <DialogContentText>
        Insert bezier paths, lines, and shapes using the Path tool found in the Insert menu.
        Hold <KeyCallout>OPTION/ALT</KeyCallout> while adding a point to immediately edit its bezier force.
        Connect a path back to its starting point to close it, or press <KeyCallout>ESCAPE</KeyCallout> at any
        time to commit the path.
        <br /><Box component="span" sx={{ display: 'inline-block', height: '34px' }} />
        Holding <KeyCallout>OPTION/ALT</KeyCallout> while clicking an existing point will Explode or
        Collapse the bezier controls connected to that point. Bezier controller handles will remain colinear to
        one another unless you hold <KeyCallout>OPTION/ALT</KeyCallout> while dragging one of them.

        <img
          loading="lazy"
          style={{ width: '100%', marginTop: '8px' }}
          src={bezierPathsGIF}
          alt="how to create and edit bezier paths"
        />
      </DialogContentText>

      <Typography variant="h5" mt={2}>
        Animate with Keyframes
      </Typography>
      <DialogContentText>
        When an object is selected, you may add a Keyframe for one of its many keyframable properties from either the
        Property Editor or the Keyframe Editor. To open the Keyframe Editor, click the arrow in the bottom-right of the
        app. Here you can set a work region, add and delete keyframes with ease, drag keyframes left and right, and edit
        the interpolation curve between any two keyframe points.

        <img
          loading="lazy"
          style={{ width: '100%', marginTop: '8px' }}
          src={addingKeyframesGIF}
          alt="how to add and edit keyframes"
        />
      </DialogContentText>

      {/* <DialogContentText>
        #### Set a Work Region
      </DialogContentText> */}

      {/* <DialogContentText>
        #### Export my Project
      </DialogContentText> */}

      {/* <DialogContentText>
        #### Use my Export in other Applications
      </DialogContentText> */}

    </DialogContent>
  </Dialog>
)

export default HelpDialog
