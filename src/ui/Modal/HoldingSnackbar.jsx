import { useEffect, useState, useRef } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Slide from '@mui/material/Slide'
import CircularProgress from '@mui/material/CircularProgress'

import theme from '../theme'

const MIN_DURATION = 2000

/**
 * This Snackbar will stay open for a minimum duration, and either close when that
 * duration has run its course, or when all reasons to be open have evaluated false.
 */
const HoldingSnackbar = ({ reasons, messages }) => {
  let message
  const shouldOpen = reasons.some((val, idx) => {
    message = messages[idx]
    return val
  })

  const timeoutRef = useRef()
  const [holdOpen, setHoldOpen] = useState(false)
  useEffect(() => {
    if (shouldOpen) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setHoldOpen(true)
      timeoutRef.current = setTimeout(() => setHoldOpen(false), MIN_DURATION)
    }
  }, [shouldOpen])

  return (
    <Snackbar
      open={shouldOpen || holdOpen}
      message={(
        <>
          {message}
          <CircularProgress size={12} sx={{ marginLeft: 2 }} />
        </>
      )}
      TransitionComponent={Slide}
      ContentProps={{
        sx: {
          color: `${theme.palette.text.main}`,
          backgroundColor: `${theme.palette.background.fullSend}`,
          border: `1px solid ${theme.palette.background.lighter1}`,
        },
      }}
    />
  )
}

export default HoldingSnackbar
