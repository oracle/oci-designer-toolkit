#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export ROOT_DIR=$(cd $(dirname $0)/../..; pwd)

docker run -d --rm -p 443:443 -p 80:80 \
       --name okit \
       --hostname okit \
       okit
