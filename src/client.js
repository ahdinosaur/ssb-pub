const assert = require('assert')
const { join } = require('path')
const { readFileSync } = require('fs')
const explain = require('explain-error')
const ssbClient = require('ssb-client')
const ssbKeys = require('ssb-keys')
const ssbCaps = require('ssb-caps')
const muxrpcli = require('muxrpcli')

module.exports = PubClient

function PubClient (config, args) {
  assert(config && typeof config === 'object', 'Expected config object')

  const {
    path,
    host = nonPrivate.v4,
    port = 8008,
    profile = {},
    services = [],
    caps = ssbCaps
  } = config

  assert(typeof path === 'string', 'Expected config.path string, got: ' + path)
  assert(typeof host === 'string', 'Expected config.host string, got: ' + host)
  assert(typeof port === 'number', 'Expected config.host number, got: ' + port)
  assert(profile && typeof profile === 'object', 'Expected config.profile object, got: ' + profile)
  assert(Array.isArray(services), 'Expected config.services array, got: ' + services)
  assert(caps && typeof caps === 'object', 'Expected config.caps object, got: ' + caps)

  // read secret
  const keysPath = join(path, 'secret')
  const keys = ssbKeys.loadSync(keysPath)

  // read manifest.json
  const manifestPath = join(path, 'manifest.json')
  var manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath))
  } catch (err) {
    throw explain(err,
      'no manifest file'
      + '- should be generated first time server is run'
    )
  }

  var opts = {
    manifest,
    port,
    host,
    caps,
    key: keys.id
  }

  ssbClient(keys, opts, function (err, rpc) {
    if (err) {
      if (/could not connect/.test(err.message)) {
        console.error('Error: Could not connect to ssb-pub ' + host + ':' + port)
        console.error('Use the "server" command to start it.')
        process.exit(1)
      }
      throw err
    }

    // run commandline flow
    const verbose = true
    muxrpcli(args, manifest, rpc, verbose)
  })
}
