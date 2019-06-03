const express = require('express')

const app = express()

if (process.env.NODE_ENV !== 'production') {
  app.use(require('./hot')) // eslint-disable-line global-require
}
app.use(express.static(`${process.cwd()}/build`))
app.get('*', (req, res) => {
  res.sendFile(`${process.cwd()}/build/index.html`)
})

app.listen(5000, () => {
  console.log('server listening on 5000')
})
