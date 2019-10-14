const { Client } = require('../')

const config = require('./config')
const args = process.argv.slice(2)

Client(config, args)
