#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export BASENAME=$(basename $0)
export DIRNAME=$(dirname $0)
export FILENAME="${BASENAME%.*}"

source $(dirname $0)/docker-env.sh


# Exec command
docker exec \
       -it \
       start-gunicorn \
       /bin/bash

docker ps -l
