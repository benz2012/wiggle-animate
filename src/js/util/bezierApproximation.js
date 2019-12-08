const approximateWithLines = (points, t) => {
  if (points.length === 1) {
    return points[0]
  }

  const newPoints = []
  for (let i = 0; i < points.length - 2; i += 1) {
    const currPoint = points[i]
    const nextPoint = points[i + 1]

    const x = (1 - t) * currPoint.x + t * nextPoint.x
    const y = (1 - t) * currPoint.y + t * nextPoint.y

    newPoints.push({ x, y })
  }

  return approximateWithLines(newPoints, t)
}

export {
  approximateWithLines,
}
