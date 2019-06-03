import React from 'react'
import ReactDOM from 'react-dom'

// Root Application Container
import App from './containers/App'
import RootStore from './store'

// Styles
import '../css'

const store = new RootStore()
const appNode = document.getElementById('app')

ReactDOM.render(
  <App store={store} />,
  appNode
)
