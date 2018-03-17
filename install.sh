#!/bin/bash

HOST = "$(dig +short myip.opendns.com @resolver1.opendns.com)"

BTYES_PER_MEGABYTE = (10**6)
TOTAL_MEMORY_IN_BYTES = $(free -b --si | awk '/Mem\:/ { print $2 }')
MEMORY_LIMIT = $((${TOTAL_MEMORY_IN_BYTES} - 200 * ${BYTES_PER_MEGABYTE}))

cd ~
sudo apt install -y curl dnsutils apt-transport-https ca-certificates software-properties-common
wget https://download.docker.com/linux/debian/gpg -O docker-gpg
sudo apt-key add docker-gpg
echo "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
  | sudo tee -a /etc/apt/sources.list.d/docker.list
sudo apt update
sudo apt install -y docker-ce
sudo systemctl start docker
sudo systemctl enable docker
docker pull ahdinosaur/ssb-pub
mkdir ~/ssb-pub-data
chown -R 1000:1000 ~/ssb-pub-data
docker run -d \
  --name sbot \
  -v ~/ssb-pub-data/:/home/node/.ssb/ \
  -e ssb_host=${HOST} \
  -p 8008:8008 \
  --restart unless-stopped \
  --memory=${MEMORY_LIMIT} \
  ahdinosaur/ssb-pub
docker pull ahdinosaur/healer
docker run -d \
  --name healer \
  -v /var/run/docker.sock:/tmp/docker.sock \
  --restart unless-stopped \
  ahdinosaur/healer
cat > ~/sbot <<EOF
docker run -it --rm \
  -v ~/ssb-pub-data/:/home/node/.ssb/ \
  -e ssb_host=${HOST} \
  ahdinosaur/ssb-pub \
  \$@
EOF
chmod +x ~/sbot
