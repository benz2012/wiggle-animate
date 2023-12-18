export const doAxisAlignedRectanglesOverlap = (a, b) => {
  /* Check if rectangle A overlaps rectangle B, or vise-versa
   * requires top-left corner (x1, y1) & bottom-right corner (x2, y2)
   * also requires both rectangles to be axis-aligned (non-rotated)
   */
  if (a.x1 >= b.x2 || b.x1 >= a.x2) return false // no horizontal overlap
  if (a.y1 >= b.y2 || b.y1 >= a.y2) return false // no vertical overlap
  return true
}

const segmentOrientation = (p, q, r) => {
  /* To find orientation of ordered triplet (p, q, r)
   * Also See https://www.geeksforgeeks.org/orientation-3-ordered-points/
   * The function returns following values
   * 0 --> p, q and r are collinear
   * 1 --> Clockwise
   * 2 --> Counterclockwise
   */
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
  if (val === 0) return 0 // collinear
  return (val > 0) ? 1 : 2 // clockwise or counterclockwise
}

const onSegment = (p, q, r) => {
  /* Given three collinear points p, q, r, the function checks if
   * point q lies on line segment 'pr'
   */
  if (
    q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x)
    && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
  ) {
    return true
  }
  return false
}

export const doLineSegmentsIntersect = (a, b, c, d) => {
  /* Check if line segment a-b intersects line segment c-d
   * Each segment point must have x-y values.
   */
  const o1 = segmentOrientation(a, b, c)
  const o2 = segmentOrientation(a, b, d)
  const o3 = segmentOrientation(c, d, a)
  const o4 = segmentOrientation(c, d, b)

  // General case
  if (o1 !== o2 && o3 !== o4) return true

  // Special Cases
  // a, b and c are collinear and c lies on segment ab
  if (o1 === 0 && onSegment(a, c, b)) return true
  // a, b and d are collinear and d lies on segment ab
  if (o2 === 0 && onSegment(a, d, b)) return true
  // c, d and a are collinear and a lies on segment cd
  if (o3 === 0 && onSegment(c, a, d)) return true
  // c, d and b are collinear and b lies on segment cd
  if (o4 === 0 && onSegment(c, b, d)) return true

  return false
}
