#!/bin/bash

#export http_proxy=http://www-proxy.us.oracle.com:80
#export https_proxy=http://www-proxy.us.oracle.com:80

source $(dirname $0)/docker-env.sh

docker images

docker rmi ${DOCKERIMAGE}

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Building OL7 Image                                           **"
echo "**                                                               **"
echo "*******************************************************************"

#   --build-arg os_version="7-slim" \
docker build \
   --tag ${DOCKERIMAGE} \
   --file ${DOCKERDIR}/docker/Dockerfile \
   --force-rm \
   --build-arg http_proxy="${http_proxy}" \
   --build-arg https_proxy="${https_proxy}" \
   --build-arg PREVIEW="true" \
   ${DOCKERDIR}/docker/

for dangling in $(docker images -f "dangling=true" -q)
do
    docker rmi ${dangling}
done

docker images