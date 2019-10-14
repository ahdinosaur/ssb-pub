const Config = require('ssb-config/inject');
const manifest = require('./manifest');

// TODO

const config = Config('ssb', {
  manifest: manifest,
  logging: {level: 'info'},
  port: 8008,
  host: '0.0.0.0',
  connections: {
    incoming: {
      net: [{scope: 'public', transform: 'shs', port: 8008, host: '0.0.0.0'}],
    },
    outgoing: {
      net: [{transform: 'shs'}],
    },
  },
});

module.exports = config
