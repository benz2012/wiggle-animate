import React from 'react'
import ReactDOM from 'react-dom/client'

import './ui/theme'
import App from './ui/App'
import RootStore from './store'
// Leave this at bottom of import stack
import './ui/Last.css'

const store = new RootStore()
// TODO: remove after debugging
window._store = store
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <App store={store} />
  </React.StrictMode>
)
