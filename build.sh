#!/bin/bash

set -e
set -o pipefail

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PKG_VERSION="0.0.1"

DEB_SRC_DIR="${DIR}/deb"
DEB_BUILD_DIR="/tmp/ssb-pub"
GO_SSB_DIR="${DIR}/go-ssb"

for PKG_ARCH in "amd64" "arm64"
do
  echo "building ssb-pub version: ${PKG_VERSION}, arch ${PKG_ARCH}"

  # delete build dir if exists
  if [ -d "${DEB_BUILD_DIR}" ]
  then
    sudo rm -rf "${DEB_BUILD_DIR}"
  fi

  # create build dir if not exists
  if [ ! -d "${DEB_BUILD_DIR}" ]
  then
    mkdir -p "${DEB_BUILD_DIR}"
  fi

  ###
  # compile ssb-pub
  ###
  cd "${GO_SSB_DIR}"
  echo "compiling sbotcli"
  env GOOS=linux GOARCH=${PKG_ARCH} go build ./cmd/sbotcli
  echo "compiling go-sbot"
  env GOOS=linux GOARCH=${PKG_ARCH} go build ./cmd/go-sbot
  cd "${DIR}"

  ###
  # package ssb-pub
  ###
  echo "packaging ssb-pub"

  # copy debian files into correct locations in package build directory
  DEB_DEBIAN_DEST_DIR="${DEB_BUILD_DIR}/DEBIAN"
  mkdir "${DEB_DEBIAN_DEST_DIR}"

  # copy maintainer scripts
  for MAINTAINER_SCRIPT in "postinst" "postrm" "prerm"
  do
    cp "${DEB_SRC_DIR}/${MAINTAINER_SCRIPT}" "${DEB_DEBIAN_DEST_DIR}/${MAINTAINER_SCRIPT}"
    chmod 755 "${DEB_DEBIAN_DEST_DIR}/${MAINTAINER_SCRIPT}"
  done

  # copy debian control file putting in templated version and arch
  export PKG_VERSION
  export PKG_ARCH
  envsubst < "${DEB_SRC_DIR}/control" > "${DEB_DEBIAN_DEST_DIR}/control"

  # copy systemd service file
  mkdir -p "${DEB_BUILD_DIR}/lib/systemd/system"
  cp "${DEB_SRC_DIR}/ssb-server.service" "${DEB_BUILD_DIR}/lib/systemd/system"
  sudo chown root:root "${DEB_BUILD_DIR}/lib/systemd/system"

  # copy config file
  mkdir -p "${DEB_BUILD_DIR}/etc/default"
  cp "${DEB_SRC_DIR}/etc-default" "${DEB_BUILD_DIR}/etc/default/ssb"
  sudo chown root:root "${DEB_BUILD_DIR}/etc/default/ssb"

  # binaries
  mkdir -p "${DEB_BUILD_DIR}/usr/bin"

  # copy compiled binaries
  cp "${GO_SSB_DIR}/go-sbot" "${DEB_BUILD_DIR}/usr/bin/ssb-server-go"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-server-go"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-server-go"
  cp "${GO_SSB_DIR}/sbotcli" "${DEB_BUILD_DIR}/usr/bin/ssb-cli-go"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-cli-go"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-cli-go"

  # copy wrapper scripts
  cp "${DEB_SRC_DIR}/ssb-server" "${DEB_BUILD_DIR}/usr/bin/ssb-server"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-server"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-server"
  cp "${DEB_SRC_DIR}/ssb-cli" "${DEB_BUILD_DIR}/usr/bin/ssb-cli"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-cli"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-cli"

  # create deb package
  DEB_FILE_NAME="ssb-pub_${PKG_VERSION}_${PKG_ARCH}.deb"
  echo "creating ${DEB_FILE_NAME}"
  cd "${DEB_BUILD_DIR}"
  dpkg-deb -b . "${DEB_FILE_NAME}"
  cd "${DIR}"

  # copy deb to output here
  cp "${DEB_BUILD_DIR}/${DEB_FILE_NAME}" "${DIR}/builds/${DEB_FILE_NAME}"
done
