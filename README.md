# ssb-pub

__work in progress__

easily host your own Secure ScuttleButt (SSB) pub in a docker container

to run a pub you need to have a static public IP, ideally with a DNS record (i.e.`<hostname.yourdomain.tld>`)

## setup box

on a fresh Debian 9 box, as root

```shell
apt update
apt upgrade
apt install apt-transport-https ca-certificates curl software-properties-common
wget https://download.docker.com/linux/debian/gpg -O docker-gpg
sudo apt-key add docker-gpg
echo "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee -a /etc/apt/sources.list.d/docker.list
apt update
apt install docker-ce
systemctl start docker
systemctl enable docker
```

## install image

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
   ahdinosaur/ssb-pub
```

## create invites

from your remote machine

```shell
docker run -it --rm \
   -d -v ~/ssb-pub-data/:/home/node/.ssb/ \
   ahdinosaur/ssb-pub \
   invite.create 1
```

from your local machine, using ssh

```shell
ssh root@<hostname.yourdomain.tld> invite.create 1
```

## control service

- `docker stop my-ssb-pub`
- `docker stop my-ssb-pub`
- `docker restart my-ssb-pub`
