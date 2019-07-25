import React, { useRef } from 'react'

const style = {
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

const Modal = ({ children, open, handleClose }) => {
  const clickawayEl = useRef(null)

  const onClickaway = (event) => {
    if (clickawayEl.current.contains(event.target)) return
    handleClose()
  }

  return (
    open === false ? null : (
      <div style={style.container} onClick={onClickaway}>
        <div ref={clickawayEl} style={style.body}>
          <div style={style.content}>{children}</div>
        </div>
      </div>
    )
  )
}

export default Modal
