// Slightly modified from: https://github.com/mourner/tinyqueue

/*
ISC License

Copyright (c) 2017, Vladimir Agafonkin

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
*/

/* eslint-disable no-bitwise */

function defaultCompare(a, b) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export default class TinyQueue {
  constructor(data = [], compare = defaultCompare) {
    this.data = data
    this.length = this.data.length
    this.compare = compare

    if (this.length > 0) {
      for (let i = (this.length >> 1) - 1; i >= 0; i -= 1) this._down(i)
    }
  }

  push(item) {
    this.data.push(item)
    this._up(this.length)
    this.length += 1
  }

  pop() {
    if (this.length === 0) return undefined

    const top = this.data[0]
    const bottom = this.data.pop()

    this.length -= 1
    if (this.length > 0) {
      this.data[0] = bottom
      this._down(0)
    }

    return top
  }

  peek() {
    return this.data[0]
  }

  _up(pos) {
    const { data, compare } = this
    const item = data[pos]

    while (pos > 0) {
      const parent = (pos - 1) >> 1
      const current = data[parent]
      if (compare(item, current) >= 0) break
      data[pos] = current
      // eslint-disable-next-line no-param-reassign
      pos = parent
    }

    data[pos] = item
  }

  _down(pos) {
    const { data, compare } = this
    const halfLength = this.length >> 1
    const item = data[pos]

    while (pos < halfLength) {
      let bestChild = (pos << 1) + 1 // initially it is the left child
      const right = bestChild + 1

      if (right < this.length && compare(data[right], data[bestChild]) < 0) {
        bestChild = right
      }
      if (compare(data[bestChild], item) >= 0) break

      data[pos] = data[bestChild]
      // eslint-disable-next-line no-param-reassign
      pos = bestChild
    }

    data[pos] = item
  }
}
