# ssb-pub

easily host your own [Secure ScuttleButt (SSB)](https://www.scuttlebutt.nz) pub!

(uses [`cryptoscope/ssb`](https://github.com/cryptoscope/ssb) `go-sbot`)

:heart:

## table of contents

- [setup](#setup)
  - [boot Debian server](#boot-debian-server)
  - [download .deb package](#download-deb-package)
  - [install .deb package](#install-deb-package)
  - [configure ssb server](#configure-ssb-server)
- [command and control](#command-and-control)
  - [publish to feed](#publish-to-feed)
  - [create invites](#create-invites)
  - [stop, start, restart service](#stop-start-restart-service)
- [upgrading](#upgrading)
  - [migrating to v4](#migrating-to-v4)
- [dev](#dev)

## setup

### boot Debian server

### download .deb package

### install .deb package

### configure ssb server

## command and control

### publish to feed

### create invites

### start, stop, restart service

## upgrading

### migrating to v4

## dev

install [Vagrant](https://www.vagrantup.com/)

boot up the Vagrant dev box

```shell
vagrant up
```

ssh into the dev box

```shell
vagrant ssh
```

go into the local dir, from the dev box

```shell
cd /vagrant
```

### build .deb packages

```shell
./deb/build.sh
```

### install package

```shell
sudo dpkg -i builds/ssb-pub_*_amd64.deb
```
