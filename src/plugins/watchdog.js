const notify = require('sd-notify')

const watchdogPlugin = {
  name: 'watchdog',
  version: '1.0.0',
  manifest: {},
  permissions: {},
  init: function WatchdogInit (server, config) {
    notify.ready()
 
    const watchdogInterval = notify.watchdogInterval()
   
    if (watchdogInterval > 0) {
      const interval = Math.floor(watchdogInterval / 2)
      notify.startWatchdogMode(interval)
    }
  }
}

module.exports = watchdogPlugin
