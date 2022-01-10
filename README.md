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
  - [systemctl service](#systemctl-service)
  - [journalctl logs](#journalctl-logs)
  - [heal message sequence mismatch](#heal-message-sequence-mismatch)
- [upgrading](#upgrading)
  - [migrating to v4](#migrating-to-v4)
- [dev](#dev)

## setup

### boot Debian server

in the cloud, or in your home, spin up a [Debian](https://www.debian.org/) server.

### download .deb package

download a .deb package from the [latest v4+ releases](https://github.com/ahdinosaur/ssb-pub/releases).

```shell
wget ${URL}
```

### install .deb package

```shell
sudo dpkg -i ssb-pub_*_*.deb
```

### configure ssb server

```shell
sudo nano /etc/default/ssb
```

```txt
SSB_PORT=8008
SSB_HOPS=2
SSB_EBT_ENABLED=no
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

### systemdctl service

```shell
sudo systemctl status ssb-server
sudo systemctl stop ssb-server
sudo systemctl start ssb-server
sudo systemctl restart ssb-server
```

### journalctl logs

see all logs in pager:

```shell
sudo journalctl -u ssb-server
```

watch live tail of logs:

```shell
sudo journalctl -u ssb-server -f
```

### heal message sequence mismatch

```shell
sudo -u ssb ssb-server-go -repo /var/lib/ssb -fsck sequences -repair
```

## upgrading

### migrating to v4

first backup your old `ssb-pub-data`, just in case!

stop all old `ssb-pub` dockers:

```shell
docker stop sbot
docker stop healer
```

remove fallback cron restarts (if they exist):

```shell
sudo rm /etc/cron.hourly/sbot
sudo rm /etc/cron.hourly/healer
```

now, after installing the v4 `ssb-pub` package:

```shell
sudo systemctl stop ssb-server
sudo rm -rf /var/lib/ssb/*

sudo cp ssb-pub-data/secret /var/lib/ssb/
sudo chmod 0400 /var/lib/ssb/secret

sudo ssb-offset-converter -if lfo ssb-pub-data/flume/log.offset /var/lib/ssb/log

sudo mv ssb-pub-data/blobs /var/lib/ssb/

sudo chown -R ssb:ssb /var/lib/ssb
sudo systemctl start ssb-server
```

watch live tail of logs:

```shell
sudo journalctl -u ssb-server -f
```

notice the indexes take time to be rebuilt. in particular, replication will deny connections until after the `update-replicate` event.

either the server will eventually receive connections from peers who try to connect, or we can force a new connection:

```shell
sudo -u ssb ssb-cli connect "net:ssb.learningsocieties.org:8008~shs:uMiN0TRVMGVNTQUb6KCbiOi/8UQYcyojiA83rCghxGo="
```

better yet, create a new invite and redeem from your personal Scuttlebutt account.

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
