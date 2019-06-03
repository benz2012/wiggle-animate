import React from 'react'

const playbarStyle = { height: '10px', margin: '10px 0px' }

const Playbar = ({
  fullWidth,
  totalFrames,
  inPoint,
  outPoint,
  now,
  ABSOLUTE_FIRST,
}) => {
  const playbarWidth = fullWidth || 0

  const per = playbarWidth / totalFrames
  const marker = totalFrames > 1 ? per : 0
  const head = parseInt((inPoint - ABSOLUTE_FIRST) * per)
  const tail = parseInt((totalFrames - outPoint) * per)

  let activeHead = parseInt((now * per) - head)
  if (totalFrames === 1) {
    activeHead = per
  } else if (now === inPoint) {
    activeHead = 0
  } else if (now === outPoint) {
    activeHead = playbarWidth - head - tail - marker
  }
  const activeTail = now === outPoint ? 0 : playbarWidth - head - tail - activeHead - marker

  return (
    <div style={{ display: 'flex' }}>
      <div style={{
        ...playbarStyle,
        width: head,
        backgroundColor: 'rgb(150, 160, 170)' }}
      />
      <div style={{
        ...playbarStyle,
        width: activeHead,
        backgroundColor: 'rgb(220, 225, 240)' }}
      />
      <div style={{
        ...playbarStyle,
        width: marker,
        height: '20px',
        marginTop: '5px',
        backgroundColor: 'rgb(30, 155, 255)' }}
      />
      <div style={{
        ...playbarStyle,
        width: activeTail,
        backgroundColor: 'rgb(220, 225, 240)' }}
      />
      <div style={{
        ...playbarStyle,
        width: tail,
        backgroundColor: 'rgb(150, 160, 170)' }}
      />
    </div>
  )
}

export default Playbar
