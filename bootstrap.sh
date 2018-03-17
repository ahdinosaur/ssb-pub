#!/bin/bash

apt update
apt upgrade -y
apt install -y git dnsutils

if [ ${HOST} == "hostname.domain.tld" ]
then
  HOST="$(dig +short myip.opendns.com @resolver1.opendns.com)"
fi

git clone https://github.com/ahdinosaur/ssb-pub ${NAME}
cd ${NAME}
source source
source ${HOME}/.bashrc

ssb-pub-install
