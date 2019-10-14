const assert = require('assert')
const { join } = require('path')
const { writeFileSync } = require('fs')
const SecretStack = require('secret-stack')
const ssbCaps = require('ssb-caps')
const ssbKeys = require('ssb-keys')
const setDefaultSsbConfig = require('ssb-config/defaults')
const nonPrivate = require('non-private-ip')

const serviceHandlers = [
  require('./services/base')
]

module.exports = PubServer

function PubServer (config) {
  assert(config && typeof config === 'object', 'Expected config object')

  const {
    path,
    host = nonPrivate.v4,
    port = 8008,
    profile = {},
    services = [],
    caps = ssbCaps
  } = config

  assert(typeof path === 'string', 'Expected config.path string, got: ' + path)
  assert(typeof host === 'string', 'Expected config.host string, got: ' + host)
  assert(typeof port === 'number', 'Expected config.host number, got: ' + port)
  assert(profile && typeof profile === 'object', 'Expected config.profile object, got: ' + profile)
  assert(Array.isArray(services), 'Expected config.services array, got: ' + services)
  assert(caps && typeof caps === 'object', 'Expected config.caps object, got: ' + caps)

  const {
    name,
    description,
  } = profile

  assert(typeof name === 'string', 'Expected config.profile.name string, got: ' + name)

  // get active services
  const pubServices = (['base', ...services]).map(service => {
    if (typeof service === 'string') {
      service = { name: service }
    }
    assert(service && typeof service === 'object', 'Expected service to be object, got: ' + service)
    assert(service.name && typeof service.name === 'string', 'Expected service.name string, got: ' + service.name)

    service.options = service.options || {}
    assert(service.options && typeof service.options === 'object', 'Expected service.options string, got: ' + service.options)

    const handler = serviceHandlers.find(({ name }) => name === service.name)
    assert(handler, 'Expected service.name to match a service handler: ' + service.name)
    return Object.assign(service, handler)
  })

  // generate ssb config
  const initialSsbConfig = generateSsbConfig({
    path,
    host,
    port,
    profile,
    caps
  })

  // run ssb config through plugins
  const ssbConfig = pubServices.reduce((configSofar, nextService) => {
    return nextService.config(configSofar, nextService.options)
  }, initialSsbConfig)

  // create ssb stack
  const initialSsbStack = SecretStack({ caps })
  const ssbStack = pubServices.reduce((stackSoFar, nextService) => {
    nextService.stack(stackSoFar, nextService.options)
    return stackSoFar
  }, initialSsbStack)

  // start ssb-server
  const server = ssbStack(ssbConfig)

  // write manifest.json
  const manifestPath = join(path, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(server.getManifest(), null, 2))
}

function generateSsbConfig (config) {
  const { path, host, port, caps, profile } = config

  const keysPath = join(path, 'secret')
  const keys = ssbKeys.loadOrCreateSync(keysPath)

  var ssbConfig = {
    path,
    host,
    port,
    profile,
    keys,
    connections: {
      incoming: {
        net: [
          {
            scope: 'public',
            host,
            port,
            external: [host],
            scope: ['public'],
            transform: 'shs'
          }
        ]
      },
      outgoing: {
        net: [
          {
            transform: 'shs'
          }
        ]
      }
    },
    caps
  }

  setDefaultSsbConfig(ssbConfig)

  // TODO change ssb-config to allow setting config.path
  ssbConfig.path = path

  return ssbConfig
}
