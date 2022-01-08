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
    services: serviceDescriptors = [],
  } = config

  assert(Array.isArray(serviceDescriptors), 'Expected config.services array, got: ' + services)

  // get active services
  const services = servicesDescriptors.map(service => {
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

  const initialConfig = { path }

  // run ssb config through plugins
  const ssbConfig = services.reduce((configSofar, nextService) => {
    return nextService.config(configSofar, nextService.options)
  }, initialConfig)

  // create ssb stack
  const initialSsbStack = SecretStack({ caps })
  const ssbStack = services.reduce((stackSoFar, nextService) => {
    nextService.stack(stackSoFar, nextService.options)
    return stackSoFar
  }, initialSsbStack)

  // start ssb-server
  const server = ssbStack(ssbConfig)

  // write manifest.json
  const manifestPath = join(path, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(server.getManifest(), null, 2))
}

