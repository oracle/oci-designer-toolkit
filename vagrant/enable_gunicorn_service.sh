#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

source /etc/bashrc

# Move from temp location
mv -v /tmp/gunicorn.service /etc/systemd/system/gunicorn.service
mv -v /tmp/gunicorn.socket /etc/systemd/system/gunicorn.socket

# Enable Gunicorn
systemctl enable gunicorn.service
systemctl enable gunicorn.socket
systemctl start gunicorn.socket
systemctl restart gunicorn.service
