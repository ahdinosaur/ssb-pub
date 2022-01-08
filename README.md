# ssb-pub

easily host your own [Secure ScuttleButt (SSB)](https://www.scuttlebutt.nz) pub

:heart:

## TODO

- [x] pub server and client
  - service interface
  - base service
    - logging plugin
    - auto-profile plugin
    - systemd plugin
- [x] http server
  - [x] initial admin config
    - name
    - description
    - host
    - services
  - [ ] reverse proxy to other service ports
  - [ ] lets encrypt
  - [ ] public landing page
  - [ ] admin-only config page
    - passwords or passwordless tokens?
  - [ ] styles
- [ ] npm package
    - [ ] bin script
    - [ ] main module
- [ ] installer
  - [x] systemd service
  - [x] systemd watchdog (using `./src/plugins/watchdog`)
  - [x] systemd memory and cpu limits
  - [ ] test deploy
- [ ] documentation
  - [ ] how to setup
- [ ] services
  - [ ] ssb-room
  - [ ] ssb-viewer
  - [ ] git-ssb

## demo

run demo pub server

```shell
node example/server
```

see your new demo identity

```shell
node example/client whoami
```

browse to http://localhost:8007 to see admin setup page

put `localhost` as host, anything else is ka pai

then after you submit the form, the server will die (to be auto-restarted), for now manually restart

notice `example/data/config.json` has been saved

and see that the pub automatically published an about message with the given name

```shell
node example/client.js createHistoryStream --id "$(node example/client.js whoami | jq -r .id)"
```

## notes

### concepts

#### service

- name: string
- config: `config => nextConfig`
- stack: `secret-stack` plugin

### config

```js
{
  path: "~pub/data"
  host: "wiggle.land",
  profile: {
    name: "Wiggle land",
    description: "A land for wiggles and so much more.",
    adminEmail: "admin@wiggle.land"
  },
  services: {
    ssb: {
      port: 8108
    },
    pub: {
      port: 8109
    }
  }
}
```

### deps

- `sudo apt install libsystemd-dev`
