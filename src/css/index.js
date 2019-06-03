const cssContext = require.context(
  '!!file-loader?name=[name].[ext]!.',
  true,
  /\.(css)$/
)

cssContext.keys().forEach(cssContext)
