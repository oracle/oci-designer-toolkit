#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export ROOT_DIR=$(cd $(dirname $0)/../..; pwd)

docker run -d --rm -p 80:80 \
       --name okit \
       --hostname okit \
       -v ~/.oci:/root/.oci:Z \
       -v ${ROOT_DIR}/okitweb:/okit/okitweb:Z \
       -v ${ROOT_DIR}/visualiser:/okit/visualiser:Z \
       -v ${ROOT_DIR}/log:/okit/log:Z \
       okit
