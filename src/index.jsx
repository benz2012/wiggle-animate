import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

// import './ui/theme' // turn this on if you ever remove the named import
import { muiTheme } from './ui/theme'

import App from './ui/App'
import RootStore from './store'
import './ui/Last.css' // Leave this at bottom of import stack

const store = new RootStore()
// TODO [-]: remove this after debugging
window._store = store
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <App store={store} />
    </ThemeProvider>
  </React.StrictMode>
)
