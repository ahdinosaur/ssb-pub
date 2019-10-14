const App = require('express')
const AppLogger = require('express-pino-logger')

module.exports = {
  name: 'ssb-pub-http',
  init: initHttpServer
}

function initHttpServer (server) {
  const app = App()

  app.use(AppLogger())

  app.get('/', function (req, res) {
    // if config not set, redirect to /setup
  })

  app.get('/setup', function (req, res) {

  })

  app.post('/setup', function (req, res) {

  })
}
