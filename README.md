# ssb-pub

easily host your own [Secure ScuttleButt (SSB)](https://www.scuttlebutt.nz) pub

:heart:

## TODO

- [x] pub server and client
  - service interface
  - base service
    - logging plugin
    - auto-profile plugin
- [ ] http server
  - [ ] initial admin config
    - name
    - description
    - host
    - services
  - [ ] public landing page
  - [ ] admin-only config page
    - passwords or passwordless tokens?
- [ ] installer
  - [ ] systemd service
  - [ ] systemd watchdog (using `./src/plugins/watchdog`)
  - [ ] systemd memory and cpu limits
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

see that the pub automatically published an about message

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
