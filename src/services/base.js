const baseService = {
  name: 'base',
  config: (config) => config,
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
      .use(require('../plugins/auto-profile'))
      .use(require('../plugins/http'))
  }
}

module.exports = baseService
