import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './ui/App'
import RootStore from './store'

const store = new RootStore()
// TODO: remove after debugging
window._store = store
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <App store={store} />
  </React.StrictMode>
)
