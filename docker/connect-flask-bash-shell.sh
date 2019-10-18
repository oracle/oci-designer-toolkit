#!/bin/bash

ERROR_PREFIX="ERROR"
WARN_PREFIX="WARNING"
INFO_PREFIX="INFO"

function log() {
  echo "${BASH_SOURCE[1]}:(${BASH_LINENO[0]}): ${FUNCNAME[1]}() : ${@}"
}

function info() {
  echo "${INFO_PREFIX}: ${BASH_SOURCE[1]}:(${BASH_LINENO[0]}): ${FUNCNAME[1]}(): ${@}"
}

function error() {
  echo "${ERROR_PREFIX}: ${BASH_SOURCE[1]}:(${BASH_LINENO[0]}): ${FUNCNAME[1]}(): ${@}"
}

export BASENAME=$(basename $0)
export DIRNAME=$(dirname $0)
export FILENAME="${BASENAME%.*}"

source $(dirname $0)/docker-env.sh

# Exec command
docker exec \
       -it \
       start-flask \
       /bin/bash

docker ps -l
