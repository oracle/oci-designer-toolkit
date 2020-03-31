#!/bin/bash

# Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

# Run Command Options
export BASH_SHELL='/bin/bash'
export FLASK_SERVER='pwd;env;python3 -m flask run --host=0.0.0.0 --port=8080 --no-debugger'
export GUNICORN_SERVER='pwd;env;gunicorn --bind=0.0.0.0:8080 --workers=2 --limit-request-line 0 '\''okitweb:create_app()'\'''
export NGINX_SERVER='pwd;env;nginx;gunicorn --workers=2 --limit-request-line 0 --bind=0.0.0.0:5000 okitweb.wsgi:app'

RUN_COMMAND=${NGINX_SERVER}
RUNTIME='nginx   '

while getopts bfgn option
do
  case "${option}"
  in
    b)
      RUN_COMMAND=${BASH_SHELL}
      RUNTIME='bash    '
      break
      ;;
    f)
      RUN_COMMAND=${FLASK_SERVER}
      RUNTIME='flask   '
      break
      ;;
    g)
      RUN_COMMAND=${GUNICORN_SERVER}
      RUNTIME='gunicorn'
      break
      ;;
    n)
      RUN_COMMAND=${NGINX_SERVER}
      RUNTIME='nginx   '
      break
      ;;
    *)
      break
      ;;
  esac
done

#echo "Runtime     : ${RUNTIME}"
#echo "Run Command : ${RUN_COMMAND}"
echo ""
echo ""
echo ""
echo "=========================================================================="
echo "=====                              ${RUNTIME}                          ====="
echo "=========================================================================="
echo ""
echo ""
echo ""

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
       -w /okit \
       -p 8080:8080 \
       -p 80:80 \
       -p 443:443 \
       --rm \
       -it \
       ${DOCKERIMAGE} \
       /bin/bash -c "${RUN_COMMAND}"

docker ps -l
