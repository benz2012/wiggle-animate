/* eslint-disable jsx-a11y/no-autofocus */
import { forwardRef } from 'react'

const Stage = forwardRef(({ width, height, devicePixelRatio }, stageRef) => (
  <canvas
    ref={stageRef}
    id="stage"
    width={width * devicePixelRatio}
    height={height * devicePixelRatio}
    style={{ width, height }}
    tabIndex="0"
    autoFocus
  />
))

export default Stage
