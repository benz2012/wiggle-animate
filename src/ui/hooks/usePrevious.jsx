import { useRef, useEffect } from 'react'

const usePrevious = (newValue) => {
  const previousRef = useRef()

  useEffect(() => {
    previousRef.current = newValue
  })

  return previousRef.current
}

export default usePrevious
