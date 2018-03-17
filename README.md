# ssb-pub

easily host your own [Secure ScuttleButt (SSB)](https://www.scuttlebutt.nz) pub in a docker container

if you feel like sharing your pub, please add it to [the informal registry of pubs](https://github.com/ssbc/scuttlebot/wiki/Pub-Servers) as request-only or with a re-usable invite (`invite.create 1000`)!

:heart:

## one-click setup

1) go to [![Install on DigitalOcean](http://butt.nz/button.svg)](http://butt.nz) at [butt.nz](http://butt.nz)
2) choose your server size and region

> ![digital-butt-step-1.png](./images/digital-butt-step-1.png)

3) log in to Digital Ocean, if not done already
4) add ssh keys, if not done already
5) start creating your pub server! :raised_hands:

> ![digital-butt-step-2.png](./images/digital-butt-step-2.png)

6) wait for a few minutes :hourglass:

> ![digital-butt-step-3.png](./images/digital-butt-step-3.png)

7) log in to your server using `ssh`

```shell
ssh root@your.ip.address.here
```

8) test your pub server works

```shell
ssb whoami
```

9) create your first invite!

```shell
ssb invite.create 1
```

> ![digital-butt-step-4.png](./images/digital-butt-step-4.png)

10) invite and host your friends on [Scuttlebutt](https://www.scuttlebutt.nz) :house_with_garden:

(credit to [seven1m/do-install-button](https://github.com/seven1m/do-install-button) for the Digital Ocean installer)

## manual setup

to run a pub you need to have a static public IP, ideally with a DNS record (i.e.`hostname.yourdomain.tld`)

on a fresh Debian 9 box, as root

### download

```shell
git clone https://github.com/ahdinosaur/ssb-pub ${NAME}
cd ${NAME}
```

### configure

```shell
export HOST=hostname.yourdomain.tld
export NAME=ssb-pub
export IMAGE=ahdinosaur/ssb-pub
```

```shell
source source
```

### install

```shell
ssb-pub-install
```

this will create a data directory in ${HOME}/${NAME}/data

> if migrating from an old server, copy your old `secret` and `gossip.json` (maybe also `blobs`) now.
>
> ```
> rsync -avz ${HOME}/${NAME}/blobs/sha256/ ${HOST}:${HOME}/${NAME}/data/blobs/sha256/
> ```

### start server

```shell
ssb-pub
```

### send a request to the server

```shell
ssb whoami
```

### create invites

from your remote machine (as root)

```shell
ssb invite.create 1
```

from your local machine, using ssh

```shell
ssh root@hostname.yourdomain.tld ssb invite.create 1
```

### check the stats

```shell
docker stats --no-stream
```

### control service

- `docker stop ${NAME}`
- `docker start ${NAME}`
- `docker restart ${NAME}`

### setup auto-healer

using [somarat/healer](https://github.com/somarat/healer)

```
ssb-pub-healer
```
