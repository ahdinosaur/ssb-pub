const { join } = require('path')

const path = join(__dirname, 'data')
const configPath = join(path, 'config.json')
const Config = require('../src/config')(configPath)

const exampleConfig = Object.assign(
  {
    path,
    host: 'localhost',
    port: 8101,
  },
  Config.get()
)

module.exports = exampleConfig
