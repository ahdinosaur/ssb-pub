const merge = require('deep-extend')

const ssbService = {
  name: 'ssb',
  config: (config, options) => {
    const {
      host = nonPrivate.v4,
      port = 8008,
      caps = ssbCaps
    } = options

    assert(typeof host === 'string', 'Expected config.host string, got: ' + host)
    assert(typeof port === 'number', 'Expected config.port number, got: ' + port)
    assert(caps && typeof caps === 'object', 'Expected config.caps object, got: ' + caps)

    // generate ssb config
    const initialSsbConfig = generateSsbConfig({
      path,
      host,
      port,
      caps,
    })

    return merge(config, initialSsbConfig)
  },
  stack: (stack) => {
    stack
      .use(require('ssb-db'))
      .use(require('ssb-master'))
    // .use(require('ssb-unix-socket'))
    // .use(require('ssb-no-auth'))
      .use(require('ssb-conn'))
      .use(require('ssb-replicate'))
      .use(require('ssb-ebt'))
      .use(require('ssb-blobs'))
      .use(require('ssb-friends'))
      .use(require('ssb-invite'))
      .use(require('../plugins/logging'))
      .use(require('../plugins/watchdog'))
  }
}

module.exports = ssbService

function generateSsbConfig (config) {
  const { path, host, port, caps } = config

  var ssbConfig = {
    path,
    host,
    port,
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

  setDefaultSsbConfig('ssb', ssbConfig)

  return ssbConfig
}
