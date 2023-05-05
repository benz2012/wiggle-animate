import { forwardRef } from 'react'

const Stage = forwardRef(({ width, height, devicePixelRatio }, stageRef) => (
  <canvas
    ref={stageRef}
    id="stage"
    width={width * devicePixelRatio}
    height={height * devicePixelRatio}
    style={{ width, height }}
  />
))

export default Stage
