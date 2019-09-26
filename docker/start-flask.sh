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
#       -e PYTHONPATH=":/okit/visualiser" \
docker run \
       ${HOSTINFO} \
       ${VOLUMES} \
       ${ENVIRONMENT} \
       -w /okit \
       -p 8080:8080 \
       --rm \
       -it \
       ${DOCKERIMAGE} \
       /bin/bash -c "pwd;env;/root/lib/oracle-cli/bin/python3 -m flask run --host=0.0.0.0 --port=8080 --no-debugger"
#       /bin/bash -c "pwd;env;/root/lib/oracle-cli/bin/python3 -m flask run --host=0.0.0.0 --port=8080 --no-debugger"

docker ps -l
