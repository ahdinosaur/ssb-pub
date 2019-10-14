# ssb-pub

easily host your own [Secure ScuttleButt (SSB)](https://www.scuttlebutt.nz) pub

:heart:

## TODO

- [x] pub server and client
  - service interface
  - base service
    - logging plugin
    - auto-profile plugin
- [x] http server
  - [x] initial admin config
    - name
    - description
    - host
    - services
  - [ ] public landing page
  - [ ] admin-only config page
    - passwords or passwordless tokens?
  - [ ] styles
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

### deps

- `sudo apt install libsystemd-dev`
