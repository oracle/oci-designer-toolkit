#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export ROOT_DIR=$(cd $(dirname $0)/../..; pwd)

docker kill okit
docker rmi okit

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Building OL7 Image                                           **"
echo "**                                                               **"
echo "*******************************************************************"

docker build \
   --tag okit \
   --file ${ROOT_DIR}/containers/docker/Dockerfile \
   --force-rm \
   ${ROOT_DIR}

for dangling in $(docker images -f "dangling=true" -q)
do
    docker rmi ${dangling}
done

docker images


echo "*******************************************************************"
echo "**                                                               **"
echo "**  okit Build Complete                                          **"
echo "**                                                               **"
echo "*******************************************************************"
