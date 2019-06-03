/* eslint import/no-extraneous-dependencies: 0 */
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

const baseConfig = require('./webpack.base.config')

const baseConfigBabelPresets = baseConfig.module.rules[0].use[0].options.presets
const baseConfigBabelPlugins = baseConfig.module.rules[0].use[0].options.plugins

module.exports = merge(baseConfig, {
  mode: 'development',
  entry: {
    app: [
      'webpack-hot-middleware/client',
      path.resolve(process.cwd(), './src/js/index'),
    ],
  },
  output: {
    filename: 'bundle.dev.js',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: baseConfigBabelPresets,
              plugins: ['react-hot-loader/babel', ...baseConfigBabelPlugins],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
})
