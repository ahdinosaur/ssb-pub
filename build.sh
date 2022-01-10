#!/bin/bash

set -e
set -o pipefail

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PKG_VERSION="4.0.0-pre.3"

DEB_SRC_DIR="${DIR}/deb"
DEB_BUILD_DIR="/tmp/ssb-pub"
GO_SSB_DIR="${DIR}/go-ssb"

# create builds dir if not exists
if [ ! -d "${DIR}/builds" ]
then
  mkdir "${DIR}/builds"
fi

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
  # package ssb-pub
  ###

  # compile binaries
  mkdir -p "${DEB_BUILD_DIR}/usr/bin"
  cd "${GO_SSB_DIR}"
  echo "compiling sbotcli"
  env GOOS=linux GOARCH=${PKG_ARCH} go build -o "${DEB_BUILD_DIR}/usr/bin/ssb-cli-go" ./cmd/sbotcli
  echo "compiling go-sbot"
  env GOOS=linux GOARCH=${PKG_ARCH} go build -o "${DEB_BUILD_DIR}/usr/bin/ssb-pub-go" ./cmd/go-sbot
  echo "compiling ssb-offset-converter"
  env GOOS=linux GOARCH=${PKG_ARCH} go build -o "${DEB_BUILD_DIR}/usr/bin/ssb-offset-converter" ./cmd/ssb-offset-converter
  cd "${DIR}"

  # fix compiled binaries permissions
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-pub-go"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-pub-go"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-cli-go"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-cli-go"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-offset-converter"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-offset-converter"

  # copy wrapper scripts
  cp "${DEB_SRC_DIR}/ssb-pub" "${DEB_BUILD_DIR}/usr/bin/ssb-pub"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-pub"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-pub"
  cp "${DEB_SRC_DIR}/ssb-cli" "${DEB_BUILD_DIR}/usr/bin/ssb-cli"
  chmod 755 "${DEB_BUILD_DIR}/usr/bin/ssb-cli"
  sudo chown root:root "${DEB_BUILD_DIR}/usr/bin/ssb-cli"

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
  cp "${DEB_SRC_DIR}/ssb-pub.service" "${DEB_BUILD_DIR}/lib/systemd/system"
  sudo chown root:root "${DEB_BUILD_DIR}/lib/systemd/system"

  # copy config file
  mkdir -p "${DEB_BUILD_DIR}/etc/default"
  cp "${DEB_SRC_DIR}/etc-default" "${DEB_BUILD_DIR}/etc/default/ssb-pub"
  sudo chown root:root "${DEB_BUILD_DIR}/etc/default/ssb-pub"

  # create deb package
  DEB_FILE_NAME="ssb-pub_${PKG_VERSION}_${PKG_ARCH}.deb"
  echo "creating ${DEB_FILE_NAME}"
  cd "${DEB_BUILD_DIR}"
  dpkg-deb -b . "${DEB_FILE_NAME}"
  cd "${DIR}"

  # copy deb to output here
  cp "${DEB_BUILD_DIR}/${DEB_FILE_NAME}" "${DIR}/builds/${DEB_FILE_NAME}"
done
