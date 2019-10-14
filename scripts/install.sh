#!/bin/bash

# https://stackoverflow.com/a/90441
set -e
set -o pipefail

PUB_HOME="${HOME}/ssb-pub"
PUB_SERVICE="ssb-pub.service"
PUB_CONFIG="${HOME}/ssb-pub/config.json"
PUB_DATA="${HOME}/ssb-pub/data"

#
# create pub directories
#
mkdir -p "${PUB_HOME}"
cd "${PUB_HOME}"

#
# install node via nvm
#
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh | bash
source "${HOME}/.nvm/nvm.sh"
nvm install 'lts/*'

#
# install ssb-pub from npm
#
npm install ssb-pub@wip --global

#
# install systemd service
#
tee "${PUB_HOME}/${PUB_SERVICE}" > /dev/null <<EOF
[Unit]
Description=ssb-pub
AssertPathExists=${PUB_HOME}
After=network.target

[Service]
Type=simple
User=${USER}
ExecStart=${HOME}/.nvm/nvm-exec ssb-pub server
WorkingDirectory=${PUB_HOME}
Restart=on-failure
RestartSec=3
WatchdogSec=30s
StartLimitIntervalSec=0
MemoryHigh=80%
MemoryMax=90%

[Install]
WantedBy=default.target
EOF

#
# enable and start systemd service (as local user)
#
systemctl --user enable ${PUB_DIR}/${PUB_SERVICE} || exit -1
systemctl --user start ${PUB_SERVICE}
systemctl --user status ${PUB_SERVICE}
