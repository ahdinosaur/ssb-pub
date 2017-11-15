# ssb-pub

__work in progress__

easily host your own Secure ScuttleButt (SSB) pub in a docker container

to run a pub you need to have a static public IP, ideally with a DNS record (i.e.`<hostname.yourdomain.tld>`)

## install image

#### (option a) pull image from docker hub

```
docker pull ahdinosaur/ssb-pub
```

#### (option b) build image from source

from GitHub:

```shell
git clone https://github.com/ahdinosaur/ssb-pub.git
cd ssb-pub
docker build -t ssb-pub .
```

## start service

#### 1. create a directory on the docker host for persisting the pub's data

```shell
mkdir ~/ssb-pub-data
```

#### 2. run the container

```shell
docker run --name my-ssb-pub \
   -d -v ~/ssb-pub-data/:/home/node/.ssb/ \
   -e HOST="<hostname.yourdomain.tld>" \
   -p 8008:8008 --restart unless-stopped \
   ssb-pub
```

## create invites

```
ssh root@<hostname.yourdomain.tld> invite.create 1
```

## control service

- `docker stop my-ssb-pub`
- `docker stop my-ssb-pub`
- `docker restart my-ssb-pub`
