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
./sbot whoami
```

9) create your first invite!

```shell
./sbot invite.create 1
```

> ![digital-butt-step-4.png](./images/digital-butt-step-4.png)

10) invite and host your friends on [Scuttlebutt](https://www.scuttlebutt.nz) :house_with_garden:

(credit to [seven1m/do-install-button](https://github.com/seven1m/do-install-button) for the Digital Ocean installer)

## advanced setup

to run a pub you need to have a static public IP, ideally with a DNS record (i.e.`<hostname.yourdomain.tld>`)

on a fresh Debian 9 box, as root

```shell
apt update
apt upgrade -y
apt install -y apt-transport-https ca-certificates curl software-properties-common
wget https://download.docker.com/linux/debian/gpg -O docker-gpg
sudo apt-key add docker-gpg
echo "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee -a /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce
systemctl start docker
systemctl enable docker
```

### install image

#### (option a) pull image from docker hub

```shell
docker pull ahdinosaur/ssb-pub
```

#### (option b) build image from source

from GitHub:

```shell
git clone https://github.com/ahdinosaur/ssb-pub.git
cd ssb-pub
docker build -t ssb-pub .
```

### start service

#### step 1. create a directory on the docker host for persisting the pub's data

```shell
mkdir ~/ssb-pub-data
chown -R 1000:1000 ~/ssb-pub-data
```

> if migrating from an old server, copy your old `secret` and `gossip.json` (maybe also `blobs`) now.
>
> ```
> rsync -avz ~/ssb-pub-data/blobs/sha256/ $HOST:~/ssb-pub-data/blobs/sha256/
> ```

#### step 2. run the container

```shell
ssb_host=<hostname.yourdomain.tld>

docker run -d --name sbot \
   -v ~/ssb-pub-data/:/home/node/.ssb/ \
   -e ssb_host="$ssb_host" \
   -p 8008:8008 \
   --restart unless-stopped \
   --memory $(($(free -b --si | awk '/Mem\:/ { print $2 }') - 200*(10**6))) \
   ahdinosaur/ssb-pub
```

where

- `--memory` sets an upper memory limit of your total memory minus 200 MB (for example: on a 1 GB server this could be simplified to `--memory 800m`)

### create invites

from your remote machine

```shell
ssb_host=<hostname.yourdomain.tld>

docker run -it --rm \
   -v ~/ssb-pub-data/:/home/node/.ssb/ \
   -e ssb_host="$ssb_host" \
   ahdinosaur/ssb-pub \
   invite.create 1
```

from your local machine, using ssh

```shell
ssb_host=<hostname.yourdomain.tld>

ssh root@$ssb_host \
  docker run --rm \
     -v ~/ssb-pub-data/:/home/node/.ssb/ \
     -e ssb_host="$ssb_host" \
     ahdinosaur/ssb-pub \
     invite.create 1
```

### control service

- `docker stop sbot`
- `docker start sbot`
- `docker restart sbot`

### setup auto-healer

using [somarat/healer](https://github.com/somarat/healer)

```shell
docker pull ahdinosaur/healer
```

```shell
docker run -d --name healer \
  -v /var/run/docker.sock:/tmp/docker.sock \
  --restart unless-stopped \
  ahdinosaur/healer
```
