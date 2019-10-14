const { join } = require('path')

const exampleConfig = {
  path: join(__dirname, 'data'),
  host: 'localhost',
  port: 8101,
  profile: {
    name: 'test pub',
    description: 'whaddup'
  },
}

module.exports = exampleConfig
