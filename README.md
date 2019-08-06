# ssb-pub

easily host your own [Secure ScuttleButt (SSB)](https://www.scuttlebutt.nz) pub in a docker container

if you feel like sharing your pub, please add it to [the informal registry of pubs](https://github.com/ssbc/scuttlebot/wiki/Pub-Servers) as a private pub with your contact details so newbies may request an invite from you!

(if you are running a v1 pub, [migrate to the latest v2!](#migrating-from-v1-to-v2) :tada: )

:heart:

## table of contents

- [one-click setup](#one-click-setup)
- [manual setup](#manual-setup)
  - [install docker](#install-docker)
  - [install `ssb-pub` image](#install-ssb-pub-image)
  - [create `sbot` container](#create-sbot-container)
  - [setup auto-healer](#setup-auto-healer)
  - [ensure containers are always running](#ensure-containers-are-always-running)
  - [(optional) add `ssb-viewer` plugin](#optional-add-ssb-viewer)
- [kubernetes setup](#kubernetes-setup)
- [command and control](#command-and-control)
  - [create invites](#create-invites)
  - [stop, start, restart containers](#stop-start-restart-containers)
- [upgrading](#upgrading)
  - [update `ssb-pub` image](#update-ssb-pub-image)
  - [migrating from v1 to v2](#migrating-from-v1-to-v2)

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

11) give your pub a name and description (optional)

> ```
> ./sbot publish --type about --about "@your.pubs.id.here" --name "Pubby McPubFace" --description "everyone should have a pub, this is mine"
> ```
>
> 12) setup your pub's domain name
>
> point a domain name (example.com) to your pub server's IP address (using a DNS A record)
>
> edit `~/ssb-pub-data/config` to change the `connections.incoming.net[].external` property from your server ip address to your domain name:
>
> ```json
> {
>   "connections": {
>     "incoming": {
>       "net": [
>         {
>           "scope": "public",
>           "host": "0.0.0.0",
>           "external": ["hostname.yourdomain.tld"],
>           "transform": "shs",
>           "port": 8008
>         }
>       ]
>     },
>     "outgoing": {
>       "net": [
>         {
>           "transform": "shs"
>         }
>       ]
>     }
>   }
> }
> ```
>
> then restart sbot:
>
> ```shell
> docker restart sbot
> ```

(credit to [seven1m/do-install-button](https://github.com/seven1m/do-install-button) for the Digital Ocean installer)

## manual setup

### install docker

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

### install `ssb-pub` image

#### (option a) pull image from docker hub

```shell
docker pull ahdinosaur/ssb-pub
```

#### (option b) build image from source

from GitHub:

```shell
git clone https://github.com/ahdinosaur/ssb-pub.git
cd ssb-pub
docker build -t ahdinosaur/ssb-pub .
```

### create `sbot` container

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

#### step 2. setup ssb config

```shell
EXTERNAL=<hostname.yourdomain.tld>

cat > ~/ssb-pub-data/config <<EOF
{
  "connections": {
    "incoming": {
      "net": [
        {
          "scope": "public",
          "host": "0.0.0.0",
          "external": ["${EXTERNAL}"],
          "transform": "shs",
          "port": 8008
        }
      ]
    },
    "outgoing": {
      "net": [
        {
          "transform": "shs"
        }
      ]
    }
  }
}
EOF
```

#### step 3. run the container

create a `./create-sbot` script:

```shell
cat > ./create-sbot <<EOF
#!/bin/bash

memory_limit="\$((\$(free -b --si | awk '/Mem\:/ { print \$2 }') - 200*(10**6)))"

docker run -d --name sbot \
   -v ~/ssb-pub-data/:/home/node/.ssb/ \
   -p 8008:8008 \
   --restart unless-stopped \
   --memory "\$memory_limit" \
   ahdinosaur/ssb-pub
EOF
```

where

- `--memory` sets an upper memory limit of your total memory minus 200 MB (for example: on a 1 GB server this could be simplified to `--memory 800m`)

then

```shell
# make the script executable
chmod +x ./create-sbot
# run the script
./create-sbot
```

#### step 4. create `./sbot` script

we will now create a shell script in `./sbot` to help us command our Scuttlebutt server running:

```shell
# create the script
cat > ./sbot <<EOF
#!/bin/sh

docker exec -it sbot sbot \$@
EOF
```

then

```shell
# make the script executable
chmod +x ./sbot
# test the script
./sbot whoami
```

### setup auto-healer

the `ssb-pub` has a built-in health check: `sbot whoami`.

when `sbot` becomes unhealthy (it will!), we want to kill the container, so it will be automatically restarted by Docker.

for this situation, we will use [somarat/healer](https://github.com/somarat/healer):

```shell
docker pull ahdinosaur/healer
```

```shell
docker run -d --name healer \
  -v /var/run/docker.sock:/tmp/docker.sock \
  --restart unless-stopped \
  ahdinosaur/healer
```

### ensure containers are always running

sometimes the `sbot` or `healer` containers will stop running (despite `--restart unless-stopped`!).

for this sitaution, we will setup two cron job scripts:

```shell
printf '#!/bin/sh\n\ndocker start sbot\n' | tee /etc/cron.hourly/sbot && chmod +x /etc/cron.hourly/sbot
printf '#!/bin/sh\n\ndocker start healer\n' | tee /etc/cron.hourly/healer && chmod +x /etc/cron.hourly/healer
```

because `docker start <service>` is [idempotent](https://en.wikipedia.org/wiki/Idempotent), it will not change anything if the service is already running, but if the service is not running it will start it.

### (optional) add `ssb-viewer` plugin

enter your `sbot` container with:

```shell
docker exec -it sbot bash
```

then run:

```shell
npm install -g git-ssb
mkdir -p ~/.ssb/node_modules
cd ~/.ssb/node_modules
git clone ssb://%MeCTQrz9uszf9EZoTnKCeFeIedhnKWuB3JHW2l1g9NA=.sha256 ssb-viewer
cd ssb-viewer
npm install
sbot plugins.enable ssb-viewer
```

edit your config to include

```json
{
  "plugins": {
    "ssb-viewer": true
  },
  "viewer": {
    "host": "0.0.0.0"
  }
}
```

edit your `./create-sbot` to include `-p 8807:8807`.

stop, remove, and re-create sbot:

```shell
docker stop sbot
docker rm sbot
./create-sbot
```

## kubernetes setup

Yaml config files for Kubernetes are included in this repository at
`hack/k8s/deployment.yaml`. This has been tested on DigitalOcean. Tweaks may be
necessary for clusters hosted by other providers.

The SSB config file is injected into the container as a volume mount. You should
update the `ssb-config` configMap in the deployment file with your external IP
or domain, and any other changes you require. Unfortunately, because this is
being done on a subPath, changes to the configMap will not propogate
automatically. Please keep this in mind if you find you need to make config
changes, or, pull requests welcome.

SSB requires persistence to store the log, secrets. The chosen default in the
included config is 5gb, but you should raise this to a level that makes sense
for your traffic. If you should find your volume filling up, follow the
instructions for your provider as to how to increase the size or migrate to a
larger volume.

After updating the config, you can install SSB into your cluster with the
following:

```shell
kubectl apply -f hack/k8s/deployment.yaml
```

This will do a number of things:

1. create a namespace on your cluster called `scuttlebutt`
1. create a service exposing port 8008
1. create a 5gb persistent volume which is mapped to `/home/node/.ssb`
1. create and inject your ssb config

Much remains the same as with the manual install. However, since we're using
Kubernetes in this case for orchestration, there is no need to run additional
services like healer, etc. as liveness checks are handled by the deployment
configuration.

I've opted short-term _not_ to expose ssh access to the running container, but
you may access it by first getting the name of your running pod, then:

```shell
kubectl exec -it <your pod name> -n scuttlebutt /bin/bash
```

From here you can invoke any of the commands detailed below.

## command and control

### create invites

from your server:

```shell
./sbot invite.create 1
```

from your local machine, using ssh:

```shell
ssh -t root@server ./sbot invite.create 1
```

### start, stop, restart containers

for `sbot`

- `docker stop sbot`
- `docker start sbot`
- `docker restart sbot`

for `healer`

- `docker stop healer`
- `docker start healer`
- `docker restart healer`

## upgrading

### update `ssb-pub` image

```shell
docker pull ahdinosaur/ssb-pub
docker stop sbot
docker rm sbot
# edit ~/ssb-pub-data/config if necessary
./create-sbot
```

### migrating from `v1` to `v2`

for a `v1` pub owner to update to the latest `v2` version of `ssb-pub`:

1. pull the latest v2 image: `docker pull ahdinosaur/ssb-pub`
2. stop sbot container: `docker stop sbot`
3. remove sbot container: `docker rm sbot`
4. [create `~/ssb-pub-data/config`](#step-2-setup-ssb-config)
5. [re-create `./create-sbot`](#step-3-run-the-container)
6. `./create-sbot`

check things are working with `docker logs sbot` and `./sbot whoami` :tada:
