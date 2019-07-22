#!/bin/bash

export BASENAME=$(basename $0)
export DIRNAME=$(dirname $0)
export FILENAME="${BASENAME%.*}"

source $(dirname $0)/docker-env.sh

# Test Docker Image exists
PCMAIMAGE=$(docker images | grep ${DOCKERIMAGE})
if [[ "$PCMAIMAGE" == "" ]]
then
    ${DOCKERDIR}/${BUILDSCRIPT}
fi

# Run command
docker run \
       ${HOSTINFO} \
       ${VOLUMES} \
       ${ENVIRONMENT} \
       -w /oci/visualiser \
       -p 8080:8080 \
       -e PYTHONPATH=":/oci/visualiser/visualiser" \
       --rm \
       -it \
       ${DOCKERIMAGE} \
       /bin/bash -c "pwd;env;python3 -m flask run --host=0.0.0.0 --port=8080 --no-debugger"

docker ps -l
