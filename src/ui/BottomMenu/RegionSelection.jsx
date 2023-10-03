/* eslint-disable react/no-array-index-key */
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LABEL_WIDTH } from './config'
import { isOdd } from '../../utility/numbers'

// TODO: Make first and last tied to animation.in/out
// TODO: if num frames shown is odd, show one extra tick in middle
// TODO: if num frames shown is even, show two extra ticks at 3rds
// TODO: allow user to click on first/last number to set animation.in/out

const mono12 = { fontFamily: 'monospace', fontSize: 12 }
const Tick = () => (
  <Box
    sx={(theme) => ({
      width: '0px',
      height: '8px',
      borderRight: `1px solid ${theme.palette.primary.main}`,
    })}
  />
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

const RegionSelection = observer(({ frameIn, frameOut, setIn, setOut }) => {
  const numFramesShown = frameOut - frameIn + 1
  let interTickNums = []

  if (numFramesShown >= 3) {
    if (isOdd(numFramesShown)) {
      // when number of frames is odd, we can show the true middle tick
      const interFrame = (numFramesShown - 1) / 2
      interTickNums = [frameIn + interFrame]
    } else {
      // otherwise, show two ticks that are vaugly at the third marks
      const interFrame = (numFramesShown - 1) / 3
      interTickNums = [Math.round(frameIn + interFrame), Math.round(frameIn + interFrame * 2)]
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
      <Box sx={{ width: `${LABEL_WIDTH}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Typography
          className="noselect"
          component="label"
          sx={{
            display: 'inline-block',
            width: '100%',
            textAlign: 'right',
            mr: 2,
            fontFamily: 'monospace',
            fontSize: 12,
            color: 'text.disabled',
          }}
        >
          WORK REGION
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ ...mono12 }}>{frameIn}</Typography>
          {interTickNums.map((frameNum) => (
            <Typography key={frameNum} sx={{ ...mono12 }}>{frameNum}</Typography>
          ))}
          <Typography sx={{ ...mono12 }}>{frameOut}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tick />
          {interTickNums.map((_, index) => [
            <Dash key={`dash-${index}`} />,
            <Tick key={`tick-${index}`} />,
          ])}
          <Dash />
          <Tick />
        </Box>
      </Box>
    </Box>
  )
})

export default RegionSelection
