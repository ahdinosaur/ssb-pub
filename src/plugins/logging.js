var Logger = require('pino')

const loggingPlugin = {
  name: 'logging',
  version: '1.0.0',
  manifest: {},
  permissions: {},
  init: function LoggingInit (server, config) {
    var logger = Logger()
    var serverLogger = logger.child({
      id: server.id
    })

    server.on('log:info', log(serverLogger, 'debug'))
    server.on('log:notice', log(serverLogger, 'info'))
    server.on('log:warning', log(serverLogger, 'warn'))
    server.on('log:error', log(serverLogger, 'error'))
    server.on('log:fatal', log(serverLogger, 'fatal'))

    server.logger = serverLogger
  }
}

module.exports = loggingPlugin

function log (logger, level) {
  return function (...ary) {
    var message = ary.join(' ')
    logger[level](message)
  }
}
