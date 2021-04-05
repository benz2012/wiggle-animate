import paper from 'paper'

const normalizedTo8Bit = normVal => parseInt(normVal * 255.0, 10)

const paperColorToRGBStr = (obj) => {
  const paperColor = new paper.Color(obj)
  return `rgb(${normalizedTo8Bit(paperColor.red)}, ${normalizedTo8Bit(paperColor.green)}, ${normalizedTo8Bit(paperColor.blue)})`
}

export {
  paperColorToRGBStr,
}
