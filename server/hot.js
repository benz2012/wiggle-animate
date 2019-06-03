/* eslint import/no-extraneous-dependencies: 0 */
/* eslint global-require: 0 */

// This module allows for hot reloading using middleware for express

const express = require('express')
const webpack = require('webpack')
const historyApiFallback = require('connect-history-api-fallback')

const webpackDevConfig = require('../webpack/webpack.dev.config')

// Router Handler
const router = express.Router()
router.use((req, res, next) => {
  // bypass this middleware in production
  if (process.env.NODE_ENV === 'production') {
    return next('router')
  }
  return next()
})

// Webpack Compiler using development configuration
const compiler = webpack(webpackDevConfig)

// Dependency needed for Dev Server
router.use(historyApiFallback({ verbose: false }))

// Webpack Middleware
router.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: webpackDevConfig.output.publicPath,
  stats: 'minimal',
}))

// Hot Module Replacment Middleware
router.use(require('webpack-hot-middleware')(compiler))


module.exports = router
