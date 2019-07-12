#!/bin/bash

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
