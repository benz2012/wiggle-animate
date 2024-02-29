import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Link from '@mui/material/Link'

import ProjectSettingText from './ProjectSettingText'

const ProjectReview = observer(({ store }) => (
  <Box sx={{ paddingRight: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Typography variant="h6">Your Animation</Typography>
    <ProjectSettingText label="Frame Length" value={`${store.animation.frames} frames`} />
    <ProjectSettingText label="Frame Rate" value={`${store.animation.fps.toFixed(2)} FPS`} />
    <ProjectSettingText
      label="Resolution"
      value={`${store.rootContainer.canvasSize.width} x ${store.rootContainer.canvasSize.height}`}
    />
    <ProjectSettingText
      label="Background Color"
      valueNotTypography={store.stage.transparent}
      value={
        store.stage.transparent ? (
          <Box component="span" sx={{ display: 'inline-flex', height: '18px', alignItems: 'center' }}>
            {!store.output.encodingOption.supportsAlpha && (
              <HighlightOffIcon sx={{ color: 'error.main', marginRight: 0.5, fontSize: 16 }} />
            )}
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              transparent
            </Typography>
          </Box>
        ) : (
          <Box component="span" sx={{ display: 'inline-flex', height: '100%', alignItems: 'center' }}>
            {store.rootContainer.canvasFill.toShortString()}
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                backgroundColor: `${store.rootContainer.canvasFill}`,
                width: '14px',
                height: '14px',
                marginLeft: 1,
                borderRadius: 1,
              }}
            />
          </Box>
        )
      }
    />

    <Box sx={{ flexGrow: 1 }} />
    <Box>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Link
        component="button"
        sx={{ fontFamily: 'monospace', fontSize: 12 }}
        onClick={() => {
          store.view.closeDialog('export')
          // Giving it a tick creates a smoother visual transition
          setTimeout(() => {
            store.view.setSettingsTab('project')
            store.view.openDialog('settings')
          }, 1)
        }}
      >
        Edit Project Settings &#8594;
      </Link>
    </Box>
  </Box>
))

export default ProjectReview
