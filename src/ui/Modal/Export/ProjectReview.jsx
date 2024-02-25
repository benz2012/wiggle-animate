import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

import ProjectSettingText from './ProjectSettingText'

const ProjectReview = observer(({ store }) => (
  <>
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
  </>
))

export default ProjectReview