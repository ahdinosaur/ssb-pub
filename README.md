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
  - [whoami](#whoami)
  - [publish to feed](#publish-to-feed)
  - [create invites](#create-invites)
  - [stop, start, restart service](#stop-start-restart-service)
- [upgrading](#upgrading)
  - [migrating to v4](#migrating-to-v4)
- [dev](#dev)

## setup

### boot Debian server

in the cloud, or in your home, spin up a [Debian](https://www.debian.org/) (or Ubuntu) server.

### download .deb package

```shell
wget TODO
```

### install .deb package

```shell
sudo dpkg -i ssb-pub_*_amd64.deb
```

### configure ssb server

```shell
sudo nano /etc/default/ssb
```

```txt
SSB_PORT=8008
SSB_WS_PORT=8989
```

## command and control

### whoami

```shell
sudo -u ssb ssb-cli call whoami
```

or to save as a variable:

(with `jq` installed)

```shell
ID=$(sudo -u ssb ssb-cli call whoami | jq -r .id)
```

### publish to feed

```shell
sudo -u ssb ssb-cli publish post "your message"
```

```shell
sudo -u ssb ssb-cli publish about --name "wiggle.land" "${ID}"
```

### create invites

the following command creates an invite with 100 uses (number can be changed):

```shell
sudo -u ssb ssb-cli invite create --uses 100
```

take the output, and replace [::] with the IP address or domain name pointing to the server.

### start, stop, restart service

```shell
sudo systemctl status ssb-server
sudo systemctl stop ssb-server
sudo systemctl start ssb-server
sudo systemctl restart ssb-server
```

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
