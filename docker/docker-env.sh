#!/bin/bash

export ROOT_DIR=$(cd $(dirname $0)/..; pwd)
#export DOCKERIMAGE=${ROOT_DIR/${HOME}\//}
#export DOCKERIMAGE="$(echo $DOCKERIMAGE | awk '{print tolower($0)}')"
export DOCKERIMAGE="$(echo ${ROOT_DIR/${HOME}\//} | awk '{print tolower($0)}')"
export VERSION="1.0.0"
export BUILDSCRIPT="build-docker-image.sh"

echo "DOCKERIMAGE = ${DOCKERIMAGE}"

# Network information
#export http_proxy=http://www-proxy.us.oracle.com:80
#export https_proxy=http://www-proxy.us.oracle.com:80

export DOCKERDIR=$(cd $(dirname $0); pwd)

# Script information
export ABSOLUTEDIRNAME=$(cd $DIRNAME; pwd)
export PROJECTROOT=${ROOT_DIR}

#if [ -z ${OCI_WORKSPACE} ]; then
#    echo "OCI_WORKSPACE has not been set exiting."
#    exit 1
#fi

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
       -v ${ROOT_DIR}/okitweb:/okit/okitweb:Z \
       -v ${ROOT_DIR}/visualiser:/okit/visualiser:Z \
       -v ${ROOT_DIR}/converter:/okit/converter:Z
"

export ENVIRONMENT="\
       -e no_proxy=* \
       -e http_proxy="${http_proxy}" \
       -e https_proxy="${https_proxy}" \
       -e ftp_proxy="${ftp_proxy}"
"

export HOSTINFO="\
       --name ${FILENAME} \
       --hostname ${FILENAME}
"

export HOSTS="\
       --add-host=www-proxy.us.oracle.com:148.87.19.20 \
       --add-host=yum.oracle.com:23.212.232.135
"
#       --add-host=yum.oracle.com:10.210.16.2


