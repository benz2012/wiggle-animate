import React from 'react'

const style = {
  clickaway: {
    position: 'fixed',
    zIndex: 90,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    position: 'fixed',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  body: {
    backgroundColor: '#fefefe',
    margin: '15% auto',
    border: '1px solid #888',
    width: '80%',
  },
  content: {
    padding: '16px',
  },
}

const Modal = ({ children, open, handleClose }) => (
  open === false ? null : (
    <div style={style.clickaway} onClick={handleClose}>
      <div style={style.container}>
        <div style={style.body}>
          <div style={style.content}>{children}</div>
        </div>
      </div>
    </div>
  )
)

export default Modal
