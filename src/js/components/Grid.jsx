import React from 'react'

const Grid = ({ children, ...style }) => (
  <div style={{ display: 'grid', ...style }}>
    {children}
  </div>
)

export default Grid
