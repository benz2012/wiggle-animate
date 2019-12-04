/* eslint import/no-extraneous-dependencies: 0 */
const webpack = require('webpack')
const merge = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const baseConfig = require('./webpack.base.config')

module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    filename: '[name].[chunkhash].js',
    hashDigestLength: 8,
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new UglifyJsPlugin({
      sourceMap: true,
      warningsFilter: src => true, // eslint-disable-line no-unused-vars
      uglifyOptions: {
        keep_fnames: true,
      },
    }),
    new webpack.HashedModuleIdsPlugin(),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: true,
  },
})
