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
       -p 80:80 \
       --rm \
       -it \
       ${DOCKERIMAGE} \
       /bin/bash -c "pwd;env;nginx;gunicorn --workers=2 --limit-request-line 0 --bind=0.0.0.0:5000 okitweb.wsgi:app"
#       /bin/bash -c "pwd;env;nginx;gunicorn --bind=0.0.0.0:5000 --workers=2 --limit-request-line 0 okitweb.wsgi:app"

docker ps -l
