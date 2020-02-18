#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

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
       /bin/bash -c "pwd;env;gunicorn --bind=0.0.0.0:8080 --workers=2 --limit-request-line 0 'okitweb:create_app()'"

docker ps -l
