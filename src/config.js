const { readFileSync, writeFileSync } = require('fs')
const explain = require('explain-error')

module.exports = Config

function Config (path) {
  return { get, set }

  function get () {
    try {
      var json = readFileSync(path, { encoding: 'utf8' })
    } catch (err) {
      if (err.code === 'ENOENT') return {}
      throw explain(err, 'failed to read config')
    }

    try {
      var config = JSON.parse(json)
    } catch (err) {
      throw explain(err, 'failed to parse config')
    }

    return config
  }

  function set (value) {
    try {
      var json = JSON.stringify(value, null, 2)
    } catch (err) {
      throw explain(err, 'failed to stringify config')
    }

    try {
      writeFileSync(path, json, { encoding: 'utf8' })
    } catch (err) {
      throw explain(err, 'failed to write config')
    }
  }
}

