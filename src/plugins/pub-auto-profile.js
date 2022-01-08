const pull = require('pull-stream')
const explain = require('explain-error')

const errorProfileMissing =
  'Failed to self-assign profile because ' +
  'the current config is missing a `config.profile` value.';

const errorWhoamiMissing =
  'Failed to self-assign profile because ' +
  'the current ssb-server is missing the `server.whoami` API.';

const errorPublishMissing =
  'Failed to self-assign profile because ' +
  'the current ssb-server is missing the `server.publish` API.';

function autoProfileInit(server, config) {
  var currentName = null
  var currentDescription = null

  if (!config.profile || typeof config.profile !== 'object') {
    server.emit('log:warning', new Error(errorProfileMissing))
    return
  }

  const { name: nextName, description: nextDescription } = config.profile

  if (!server.whoami) return server.emit('log:error', new Error(errorWhoamiMissing))
  if (!server.publish) return server.emit('log:error', new Error(errorPublishMissing))

  server.whoami(function (err, whoami) {
    if (err) return server.emit('log:error', explain(err, 'Failed to get whoami'))

    const { id } = whoami

    pull(
      server.createUserStream({ id }),
      pull.filter(message => {
        if (!message || typeof message !== 'object') return false
        if (!message.value || typeof message.value !== 'object') return false
        if (!message.value.content || typeof message.value.content !== 'object') return false
        return message.value.content.type === 'about'
      }),
      pull.map(message => {
        if (typeof message.value.content.name === 'string') currentName = message.value.content.name
        if (typeof message.value.content.description === 'string') currentDescription = message.value.content.description
        return message
      }),
      pull.onEnd(err => {
        if (err) return server.emit('log:error', explain(err, 'Failed in reading current about message log'))

        var nextAboutMessage = { type: 'about', about: id }
        var shouldPublishAboutMessage = false
        if (currentName !== nextName) {
          nextAboutMessage.name = nextName
          shouldPublishAboutMessage = true
        }
        if (currentDescription !== nextDescription) {
          nextAboutMessage.description = nextDescription
          shouldPublishAboutMessage = true
        }
        if (shouldPublishAboutMessage) {
          server.publish(nextAboutMessage, (err, info) => {
            if (err) return server.emit('log:error', explain(err, 'Failed to publish about message'))
            else server.emit('log:info', 'Profile auto-updated successfully');
          })
        }
      })
    )
  })
}

const autoProfilePlugin = {
  name: 'auto-profile',
  version: '1.0.0',
  manifest: {},
  permissions: {},
  init: autoProfileInit
}

module.exports = autoProfilePlugin
