#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

docker rmi okit

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Building OL7 Image                                           **"
echo "**                                                               **"
echo "*******************************************************************"

docker build \
   --tag okit \
   --file ../docker/Dockerfile \
   --force-rm \
   ../docker/

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
