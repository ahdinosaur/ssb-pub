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

to run a pub you need to have a static public IP, ideally with a DNS record (i.e.`hostname.yourdomain.tld`)

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

### set environment

```shell
cat > ~/source <<EOF
export NAME=ssb-pub
export HOST=hostname.yourdomain.tld

export BYTES_PER_MEGABYTE=\$((10**6))
export TOTAL_MEMORY_IN_BYTES=\$(free -b | awk '/Mem\:/ { print \$2 }')
export MEMORY_LIMIT=\$((\${TOTAL_MEMORY_IN_BYTES} - \$((200 * \${BYTES_PER_MEGABYTE}))))
EOF

source ~/source
echo "source source" >> ~/.bashrc
```

### create data directory to become docker volume

```shell
mkdir /root/${NAME}
chown -R 1000:1000 /root/${NAME}
```

> if migrating from an old server, copy your old `secret` and `gossip.json` (maybe also `blobs`) now.
>
> ```
> rsync -avz /root/ssb-pub-data/blobs/sha256/ $HOST:/root/ssb-pub-data/blobs/sha256/
> ```

### initialize the pub

```shell
cat > ~/init <<EOF
docker run -d --name \${NAME} \
   -v /root/\${NAME}/:/home/node/.ssb/ \
   -e ssb_host=\${HOST} \
   -p 8008:8008 \
   --restart unless-stopped \
   --memory \${MEMORY_LIMIT} \
   ahdinosaur/ssb-pub
EOF
chmod +x ~/init
~/init
```

where

- `--memory` sets an upper memory limit of your total memory minus 200 MB (for example: on a 1 GB server this could be simplified to `--memory 800m`)

### send a request to the server

```shell
cat > ~/sbot <<EOF
docker run -it --rm \
  -v /root/\${NAME}/:/home/node/.ssb/ \
  -e ssb_host=\${HOST} \
  ahdinosaur/ssb-pub \
  \$@
EOF
chmod +x ~/sbot
```

```shell
~/sbot whoami
```

### create invites

from your remote machine (as root)

```shell
~/sbot invite.create 1
```

from your local machine, using ssh

```shell
ssh root@hostname.yourdomain.tld ./sbot invite.create 1
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

```shell
docker pull ahdinosaur/healer
```

```shell
cat > ~/healer <<EOF
docker run -d --name healer \
  -v /var/run/docker.sock:/tmp/docker.sock \
  --restart unless-stopped \
  ahdinosaur/healer
EOF
chmod +x ~/healer
~/healer
```
