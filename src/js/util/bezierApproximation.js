const findPointWithLines = (points, t) => {
  if (points.length === 1) {
    return points[0]
  }

  const newPoints = []
  for (let i = 0; i < points.length - 1; i += 1) {
    const currPoint = points[i]
    const nextPoint = points[i + 1]

    const x = (1 - t) * currPoint.x + t * nextPoint.x
    const y = (1 - t) * currPoint.y + t * nextPoint.y

    newPoints.push({ x, y })
  }

  return findPointWithLines(newPoints, t)
}

const bezierPoints = ({ x2, x3, y2, y3 }, segments) => {
  /* x2, and x3 are the X values from the 2nd and 3rd points for a bezier
      definition. For this use case, they must be between 0 - 1.
  */
  if (x2 > 1 || x2 < 0 || x3 > 1 || x3 < 0) {
    throw Error('This bezier curve requires control values between 0 & 1')
  }

  const points = []
  const step = 1 / segments

  for (let i = 0; i <= segments; i += 1) {
    const time = i * step
    const point = findPointWithLines([
      { x: 0, y: 0 },
      { x: x2, y: y2 },
      { x: x3, y: y3 },
      { x: 1, y: 1 },
    ], time)

    points.push(point)
  }

  return points
}

const lerp = (x1, y1, x2, y2, xInterp) => (
  (((xInterp - x1) * (y2 - y1)) / (x2 - x1)) + y1
)

const bezierApproximation = (handlePoints, samples) => {
  if (samples <= 0) {
    throw Error('Bezier approximation requires at least 1 sample request')
  }

  const granularity = 10 ** (Math.round(Math.log10(samples)) + 1)
  const points = bezierPoints(handlePoints, granularity)

  const y = (x) => {
    const afterPointIndex = points.findIndex(point => point.x > x)
    const before = points[afterPointIndex - 1]
    const after = points[afterPointIndex]
    return lerp(before.x, before.y, after.x, after.y, x)
  }

  return { y }
}

export default bezierApproximation
