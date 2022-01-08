const { join } = require('path')

const path = join(__dirname, 'data')
const configPath = join(path, 'config.json')
const Config = require('../src/config')(configPath)

const defaultConfig = Object.assign(
  {
    path,
    host: 'localhost',
    services: [
      {
        name: 'base'
    port: 8101,
  },
  Config.get()
)

module.exports = defaultConfig
