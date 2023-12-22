import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { reaction } from 'mobx'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'overlayscrollbars/styles/overlayscrollbars.css'

import { muiTheme } from './ui/theme'

import App from './ui/App'
import RootStore from './store'
import { peekAtKeyframes } from './utility/tree'
import './utility/fonts'
import './ui/Last.css' // Leave this at bottom of import stack

const store = new RootStore()
// TODO [-]: remove this after debugging
window._store = store
const root = ReactDOM.createRoot(document.getElementById('root'))

// React to Any Keyframed property in the Tree, or the Current Frame
// This will then trigger draw changes observed via React
reaction(() => ([
  Object.values(store.rootContainer.children).map(peekAtKeyframes),
  store.animation.now,
]), () => {
  store.rootContainer.updatePropertiesForFrame(store.animation.now)
})

root.render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <App store={store} />
    </ThemeProvider>
  </React.StrictMode>
)
