const pubService = {
  name: 'pub',
  config: (config, options) => {
    const { profile } = options

    if (profile) {
      assert(typeof profile === 'object', 'Expected config.profile object, got: ' + profile)
      assert(typeof profile.name === 'string', 'Expected config.profile.name string, got: ' + profile.name)
    }

  },
  stack: (stack) => {
    stack
      .use(require('../plugins/pub-auto-profile'))
      .use(require('../plugins/pub-web'))
  }
}

module.exports = pubService
