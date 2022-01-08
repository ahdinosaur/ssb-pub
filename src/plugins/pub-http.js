const { join } = require('path')
const { writeFileSync } = require('fs')
const Express = require('express')
const ExpressLogger = require('express-pino-logger')
const bodyParser = require('body-parser')

const Config = require('../config')

module.exports = {
  name: 'ssb-pub-http',
  init: PubWeb
}

function PubWeb (server, config) {
  const pubConfigPath = join(config.path, 'config.json')
  const PubConfig = Config(pubConfigPath)
  const port = 8007
  const app = Express()

  app.use(ExpressLogger())
  app.use(Express.static(join(__dirname, '../assets')))
  app.use(bodyParser.urlencoded({ extended: true }))

  app.set('port', port)
  app.set('views', join(__dirname, '../pages'))
  app.set('view engine', 'ejs')

  app.get('/', function (req, res) {
    // if config not set, redirect to /setup
    if (config.profile == null || config.admin == null) {
      server.logger.debug('There is no config set, ask for setup')
      res.redirect('setup')
      return
    }

    res.render('landing')
  })

  app.get('/setup', function (req, res) {
    // if config already set
    if (config.profile != null && config.admin != null) {
      server.logger.debug('There is already a config set, redirect to landing')
      res.redirect('/')
      return
    }

    // if config being set
    const { query } = req
    if (query && query.pubName && query.adminEmail) {
      const pubConfig = {
        host: query.host,
        profile: {
          name: query.pubName,
          description: query.pubDescription
        },
        admin: {
          email: query.adminEmail
        }
      }
      PubConfig.set(pubConfig)
      server.logger.debug('Wrote config, stopping server (to be restarted)')
      res.redirect('/')
      // TODO: a more graceful sway
      res.on('finish', () => process.exit(1))
      return
    }

    // if config not set nor being set
    res.render('setup')
  })

  const httpServer = app.listen(app.get('port'), () => {
    const address = httpServer.address()
    const { port } = address

    const url = process.env.NODE_ENV !== 'production'
      ? 'http://localhost:' + port
      : config.host

    server.logger.info({ port, url })
  })
}
