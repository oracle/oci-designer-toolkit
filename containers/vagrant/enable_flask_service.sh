#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

source /etc/bashrc

# Move from temp location
mv -v /tmp/flask.service /etc/systemd/system/flask.service

# Enable and Start Flask
systemctl enable flask.service
systemctl start flask.service
