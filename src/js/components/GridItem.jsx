import React from 'react'

const GridItem = ({ id, children, ...style }) => (
  <div id={id} style={style}>
    {children}
  </div>
)

export default GridItem
