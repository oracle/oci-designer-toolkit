#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

source /etc/bashrc

# Move from temp location
mv -v /tmp/nginx.conf /etc/nginx/nginx.conf

# Enable and Start nginx
systemctl enable nginx
systemctl start nginx
