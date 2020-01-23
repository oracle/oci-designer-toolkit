#!/bin/bash

# Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]

export ROOT_DIR=$(cd $(dirname $0)/..; pwd)
export DOCKERIMAGE="$(echo ${ROOT_DIR/${HOME}\//} | awk '{print tolower($0)}')"
export VERSION="1.0.0"
export BUILDSCRIPT="build-docker-image.sh"

echo "DOCKERIMAGE = ${DOCKERIMAGE}"

export DOCKERDIR=$(cd $(dirname $0); pwd)

# Script information
export ABSOLUTEDIRNAME=$(cd $DIRNAME; pwd)
export PROJECTROOT=${ROOT_DIR}

if [ -z ${OCI_CONFIG_DIR} ]
then
    echo "OCI_CONFIG_DIR has not been set exiting."
    exit 1
fi

#       -v ${OCI_WORKSPACE}:/okit/workspace:Z \
export VOLUMES="\
       -v ${OCI_CONFIG_DIR}:/okit/config:Z \
       -v ${OCI_CONFIG_DIR}:/root/.oci:Z \
       -v ${ROOT_DIR}/unittests:/okit/unittests:Z \
       -v ${ROOT_DIR}/output/terraform:/okit/terraform:Z \
       -v ${ROOT_DIR}/output/ansible:/okit/ansible:Z \
       -v ${ROOT_DIR}/output/python:/okit/python:Z \
       -v ${ROOT_DIR}/output/log:/okit/log:Z \
       -v ${ROOT_DIR}/okitweb:/okit/okitweb:Z \
       -v ${ROOT_DIR}/visualiser:/okit/visualiser:Z \
       -v ${ROOT_DIR}/converter:/okit/converter:Z
"

export ENVIRONMENT="\
       -e OCI_LOGFILE=/okit/log/okit.log \
       -e no_proxy=* \
       -e http_proxy="${http_proxy}" \
       -e https_proxy="${https_proxy}" \
       -e ftp_proxy="${ftp_proxy}"
"

export HOSTINFO="\
       --name ${FILENAME} \
       --hostname ${FILENAME}
"

export HOSTS=""


