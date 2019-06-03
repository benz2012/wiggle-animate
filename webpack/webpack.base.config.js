/* eslint import/no-extraneous-dependencies: 0 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    app: path.resolve(process.cwd(), './src/js/index'),
  },
  output: {
    path: path.resolve(process.cwd(), 'build'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/env', { modules: false }], '@babel/react'],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                '@babel/plugin-proposal-object-rest-spread',
              ],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|css)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[md5:hash:hex:6].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), './src/index.html'),
      inject: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
}
