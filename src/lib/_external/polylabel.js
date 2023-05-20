// Slightly modified from: https://github.com/mapbox/polylabel
// Read more here: https://blog.mapbox.com/a-new-algorithm-for-finding-a-visual-center-of-a-polygon-7c77e6492fbc

/*
ISC License
Copyright (c) 2016 Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO
THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA
OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS
SOFTWARE.
*/

import Queue from './tinyqueue'

function compareMax(a, b) {
  return b.max - a.max
}

// get squared distance from a point to a segment
function getSegDistSq(px, py, a, b) {
  let [x, y] = a
  let dx = b[0] - x
  let dy = b[1] - y

  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy)

    if (t > 1) {
      [x, y] = b
    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }

  dx = px - x
  dy = py - y

  return dx * dx + dy * dy
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(x, y, polygon) {
  let inside = false
  let minDistSq = Infinity

  for (let k = 0; k < polygon.length; k += 1) {
    const ring = polygon[k]

    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i, i += 1) {
      const a = ring[i]
      const b = ring[j]

      if ((a[1] > y !== b[1] > y)
        && (x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0])) inside = !inside

      minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b))
    }
  }

  return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq)
}

class Cell {
  constructor(x, y, h, polygon) {
    this.x = x // cell center x
    this.y = y // cell center y
    this.h = h // half the cell size
    this.d = pointToPolygonDist(x, y, polygon) // distance from cell center to polygon
    this.max = this.d + this.h * Math.SQRT2 // max distance to polygon within a cell
  }
}

// get polygon centroid
function getCentroidCell(polygon) {
  let area = 0
  let x = 0
  let y = 0
  const points = polygon[0]

  for (let i = 0, len = points.length, j = len - 1; i < len; j = i, i += 1) {
    const a = points[i]
    const b = points[j]
    const f = a[0] * b[1] - b[0] * a[1]
    x += (a[0] + b[0]) * f
    y += (a[1] + b[1]) * f
    area += f * 3
  }
  if (area === 0) return new Cell(points[0][0], points[0][1], 0, polygon)
  return new Cell(x / area, y / area, 0, polygon)
}

function polylabel(polygon, precision = 1.0) {
  // find the bounding box of the outer ring
  let minX
  let minY
  let maxX
  let maxY

  for (let i = 0; i < polygon[0].length; i += 1) {
    const p = polygon[0][i]
    if (!i || p[0] < minX) { [minX] = p }
    if (!i || p[1] < minY) { [, minY] = p }
    if (!i || p[0] > maxX) { [maxX] = p }
    if (!i || p[1] > maxY) { [, maxY] = p }
  }

  const width = maxX - minX
  const height = maxY - minY
  const cellSize = Math.min(width, height)
  let h = cellSize / 2

  if (cellSize === 0) {
    const degeneratePoleOfInaccessibility = [minX, minY]
    degeneratePoleOfInaccessibility.distance = 0
    return degeneratePoleOfInaccessibility
  }

  // a priority queue of cells in order of their "potential" (max distance to polygon)
  const cellQueue = new Queue(undefined, compareMax)

  // cover polygon with initial cells
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      cellQueue.push(new Cell(x + h, y + h, h, polygon))
    }
  }

  // take centroid as the first best guess
  let bestCell = getCentroidCell(polygon)

  // second guess: bounding box centroid
  const bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon)
  if (bboxCell.d > bestCell.d) bestCell = bboxCell

  while (cellQueue.length) {
    // pick the most promising cell from the queue
    const cell = cellQueue.pop()

    // update the best cell if we found a better one
    if (cell.d > bestCell.d) {
      bestCell = cell
    }

    // do not drill down further if there's no chance of a better solution
    // eslint-disable-next-line no-continue
    if (cell.max - bestCell.d <= precision) continue

    // split the cell into four cells
    h = cell.h / 2
    cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon))
    cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon))
    cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon))
    cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon))
  }

  const poleOfInaccessibility = [bestCell.x, bestCell.y]
  poleOfInaccessibility.distance = bestCell.d
  return poleOfInaccessibility
}

export default polylabel
